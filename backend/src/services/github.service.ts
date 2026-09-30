import { prisma } from '../config/db.js';

export class GitHubService {
  private static GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
  private static GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

  static getConnectUrl(state?: string): string {
    const clientId = this.GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.GITHUB_REDIRECT_URI || 'http://localhost:5000/api/github/callback');
    const scope = encodeURIComponent('repo user');
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state || 'productforge'}`;
  }

  static async handleCallback(userId: string, code: string): Promise<any> {
    const clientId = this.GITHUB_CLIENT_ID;
    const clientSecret = this.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('GitHub Client ID or Secret is not configured on backend.');
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData = await tokenResponse.json() as any;

    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange authorization code for GitHub access token.');
    }

    const accessToken = tokenData.access_token;
    return await this.saveConnection(userId, accessToken);
  }

  static async saveConnection(userId: string, accessToken: string, usernameOverride?: string): Promise<any> {
    let username = usernameOverride || 'github-user';
    let avatarUrl = '';
    let githubUserId = '';

    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'ProductForge-Platform',
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (userRes.ok) {
        const userData = await userRes.json() as any;
        username = userData.login || username;
        avatarUrl = userData.avatar_url || '';
        githubUserId = String(userData.id || '');
      }
    } catch (err) {
      console.warn('Failed to fetch GitHub profile with token, using fallback defaults', err);
    }

    const connection = await prisma.gitHubConnection.upsert({
      where: { userId },
      create: {
        userId,
        githubUserId,
        githubUsername: username,
        accessToken,
        avatarUrl,
        connectedAt: new Date()
      },
      update: {
        githubUserId,
        githubUsername: username,
        accessToken,
        avatarUrl,
        updatedAt: new Date()
      }
    });

    return {
      id: connection.id,
      githubUsername: connection.githubUsername,
      avatarUrl: connection.avatarUrl,
      connectedAt: connection.connectedAt
    };
  }

  static async getConnectionStatus(userId: string): Promise<any> {
    const conn = await prisma.gitHubConnection.findUnique({
      where: { userId },
      select: {
        id: true,
        githubUsername: true,
        avatarUrl: true,
        connectedAt: true,
        updatedAt: true
      }
    });

    return {
      isConnected: !!conn,
      connection: conn || null
    };
  }

  static async disconnectUser(userId: string): Promise<void> {
    await prisma.gitHubConnection.deleteMany({
      where: { userId }
    });
  }

  static async getUserRepositories(userId: string): Promise<any[]> {
    const conn = await prisma.gitHubConnection.findUnique({
      where: { userId }
    });

    if (!conn || !conn.accessToken) {
      throw new Error('GitHub account is not connected. Please connect GitHub first.');
    }

    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator', {
      headers: {
        'Authorization': `Bearer ${conn.accessToken}`,
        'User-Agent': 'ProductForge-Platform',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API Error (${response.status}): ${errorText}`);
    }

    const repos = await response.json() as any[];

    return repos.map(r => ({
      id: String(r.id),
      name: r.name,
      fullName: r.full_name,
      owner: r.owner?.login,
      htmlUrl: r.html_url,
      description: r.description,
      isPrivate: r.private,
      defaultBranch: r.default_branch,
      updatedAt: r.updated_at,
      stargazersCount: r.stargazers_count
    }));
  }

  static async connectProductToRepo(
    productId: string,
    repoData: {
      repoId?: string;
      owner: string;
      repoName: string;
      url?: string;
      defaultBranch?: string;
    }
  ): Promise<any> {
    const fullRepoUrl = repoData.url || `https://github.com/${repoData.owner}/${repoData.repoName}`;
    const defaultBranch = repoData.defaultBranch || 'main';

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        githubRepo: `${repoData.owner}/${repoData.repoName}`,
        githubRepoId: repoData.repoId ? String(repoData.repoId) : null,
        githubOwner: repoData.owner,
        githubRepoName: repoData.repoName,
        githubUrl: fullRepoUrl,
        githubDefaultBranch: defaultBranch,
        githubConnectedAt: new Date(),
        lastSyncedAt: new Date()
      }
    });

    return updatedProduct;
  }

  static async disconnectProductRepo(productId: string): Promise<any> {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        githubRepo: null,
        githubRepoId: null,
        githubOwner: null,
        githubRepoName: null,
        githubUrl: null,
        githubDefaultBranch: null,
        githubConnectedAt: null,
        lastSyncedAt: null
      }
    });

    return updatedProduct;
  }

  static async getRepoReleases(productId: string, userId: string): Promise<any[]> {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.githubOwner || !product.githubRepoName) {
      throw new Error('No GitHub repository is connected to this product.');
    }

    const conn = await prisma.gitHubConnection.findUnique({
      where: { userId }
    });

    const headers: Record<string, string> = {
      'User-Agent': 'ProductForge-Platform',
      'Accept': 'application/vnd.github.v3+json'
    };

    if (conn?.accessToken) {
      headers['Authorization'] = `Bearer ${conn.accessToken}`;
    }

    const apiUrl = `https://api.github.com/repos/${product.githubOwner}/${product.githubRepoName}/releases`;
    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      const errorText = await response.text();
      throw new Error(`Failed to fetch releases from GitHub (${response.status}): ${errorText}`);
    }

    const releases = await response.json() as any[];

    return releases.map(r => ({
      id: String(r.id),
      tagName: r.tag_name,
      name: r.name || r.tag_name,
      body: r.body || '',
      isDraft: r.draft,
      isPrerelease: r.prerelease,
      htmlUrl: r.html_url,
      publishedAt: r.published_at,
      assets: (r.assets || []).map((a: any) => ({
        id: String(a.id),
        name: a.name,
        size: a.size,
        downloadUrl: a.browser_download_url,
        contentType: a.content_type
      }))
    }));
  }

  static async syncReleases(productId: string, userId: string): Promise<{ syncedCount: number; releases: any[] }> {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.githubOwner || !product.githubRepoName) {
      throw new Error('No GitHub repository is associated with this product.');
    }

    const githubReleases = await this.getRepoReleases(productId, userId);
    let syncedCount = 0;
    const syncedVersions: any[] = [];

    for (const ghRelease of githubReleases) {
      if (ghRelease.isDraft) continue;

      const existingVersion = await prisma.productVersion.findFirst({
        where: {
          productId,
          OR: [
            { githubReleaseId: ghRelease.id },
            { versionNumber: ghRelease.tagName }
          ]
        }
      });

      if (!existingVersion) {
        const newVersion = await prisma.productVersion.create({
          data: {
            productId,
            versionNumber: ghRelease.tagName,
            releaseTitle: ghRelease.name || `Release ${ghRelease.tagName}`,
            releaseNotes: ghRelease.body || 'Synchronized from GitHub Release.',
            changelog: ghRelease.body || null,
            isBeta: ghRelease.isPrerelease,
            isCurrent: true,
            githubReleaseId: ghRelease.id,
            releaseUrl: ghRelease.htmlUrl,
            releaseTagName: ghRelease.tagName,
            publishedAt: ghRelease.publishedAt ? new Date(ghRelease.publishedAt) : new Date()
          }
        });

        if (ghRelease.assets && ghRelease.assets.length > 0) {
          for (const asset of ghRelease.assets) {
            await prisma.productFile.create({
              data: {
                versionId: newVersion.id,
                fileName: asset.name,
                fileSize: asset.size || 0,
                mimeType: asset.contentType || 'application/octet-stream',
                storagePath: asset.downloadUrl,
                checksum: `GH-${asset.id}`
              }
            });
          }
        }

        syncedVersions.push(newVersion);
        syncedCount++;
      } else {
        const updatedVersion = await prisma.productVersion.update({
          where: { id: existingVersion.id },
          data: {
            releaseTitle: ghRelease.name || existingVersion.releaseTitle,
            releaseNotes: ghRelease.body || existingVersion.releaseNotes,
            githubReleaseId: ghRelease.id,
            releaseUrl: ghRelease.htmlUrl,
            releaseTagName: ghRelease.tagName
          }
        });
        syncedVersions.push(updatedVersion);
      }
    }

    await prisma.product.update({
      where: { id: productId },
      data: { lastSyncedAt: new Date() }
    });

    return { syncedCount, releases: syncedVersions };
  }
}
