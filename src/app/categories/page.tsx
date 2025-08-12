import prisma from '@/lib/prisma';

interface Category {
  id: number;
  name: string;
}

export default async function CategoriesPage() {
  const categories: Category[] = await prisma.category.findMany();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Categories</h1>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
}
