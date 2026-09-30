import { prisma } from '../config/db.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class CategoryService {
  static async getAll() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: {
              where: { status: { in: ['PUBLISHED', 'BETA'] } }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  static async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    if (!category) {
      throw { statusCode: 404, message: 'Category not found.' };
    }
    return category;
  }

  static async create(data: { name: string; slug?: string; icon?: string; description?: string }) {
    const trimmedName = data.name?.trim();
    if (!trimmedName) {
      throw { statusCode: 400, message: 'Category name is required.' };
    }

    // Check if category with same name exists (case-insensitive)
    const all = await prisma.category.findMany();
    const existing = all.find(c => c.name.toLowerCase() === trimmedName.toLowerCase());

    if (existing) {
      return existing;
    }

    let baseSlug = data.slug ? slugify(data.slug) : slugify(trimmedName);
    if (!baseSlug) baseSlug = 'category';

    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug: finalSlug,
        icon: data.icon?.trim() || 'Sparkles',
        description: data.description?.trim() || null
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    return category;
  }

  static async update(id: string, data: { name?: string; icon?: string; description?: string }) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw { statusCode: 404, message: 'Category not found.' };
    }

    const updateData: any = {};
    if (data.name !== undefined) {
      const trimmed = data.name.trim();
      if (!trimmed) throw { statusCode: 400, message: 'Category name cannot be empty.' };
      updateData.name = trimmed;
    }
    if (data.icon !== undefined) updateData.icon = data.icon.trim() || 'Sparkles';
    if (data.description !== undefined) updateData.description = data.description.trim() || null;

    return prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
  }

  static async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      throw { statusCode: 404, message: 'Category not found.' };
    }

    if (category._count.products > 0) {
      throw {
        statusCode: 400,
        message: `Cannot delete category "${category.name}" because it contains ${category._count.products} associated product(s). Please reassign or delete the products first.`
      };
    }

    await prisma.category.delete({ where: { id } });
    return { id, name: category.name };
  }
}
