"use client";

import { useState } from 'react';

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
  category: string;
  description: string;
  seller: string;
  rating: number;
};

export function BookMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'textbooks', name: 'Libros de Texto' },
    { id: 'novels', name: 'Novelas' },
    { id: 'reference', name: 'Referencia' },
    { id: 'magazines', name: 'Revistas' }
  ];

  const books: Book[] = [
    {
      id: '1',
      title: 'Introducción a la Programación',
      author: 'John Doe',
      price: 45.99,
      image: '/books/programming.jpg',
      category: 'textbooks',
      description: 'Libro introductorio a la programación con ejemplos prácticos.',
      seller: 'Universidad Central',
      rating: 4.5
    },
    {
      id: '2',
      title: 'Cálculo Avanzado',
      author: 'Jane Smith',
      price: 55.99,
      image: '/books/calculus.jpg',
      category: 'textbooks',
      description: 'Cálculo diferencial e integral para estudiantes avanzados.',
      seller: 'Facultad de Ciencias',
      rating: 4.8
    },
    {
      id: '3',
      title: 'Revista de Investigación',
      author: 'Editorial Científica',
      price: 15.99,
      image: '/books/magazine.jpg',
      category: 'magazines',
      description: 'Últimas investigaciones en el campo de la tecnología.',
      seller: 'Biblioteca Central',
      rating: 4.2
    }
  ];

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#111111] rounded-xl p-6 border border-[#2A2A2A]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Marketplace de Libros</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Buscar libros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#FFD700]"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-[#FFD700] text-black'
                : 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#2A2A2A] hover:border-[#FFD700] transition-colors"
          >
            <div className="aspect-[3/4] bg-[#2A2A2A] relative">
              <div className="absolute inset-0 flex items-center justify-center text-[#B8B8B8]">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white">{book.title}</h3>
                <span className="text-[#FFD700] font-bold">{book.price} USDC</span>
              </div>
              <p className="text-[#B8B8B8] text-sm mb-2">{book.author}</p>
              <p className="text-[#B8B8B8] text-sm mb-4 line-clamp-2">{book.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-[#B8B8B8] text-sm">{book.rating}</span>
                </div>
                <button className="px-4 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC000] transition-colors font-medium">
                  Comprar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-[#B8B8B8] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">No se encontraron libros</h3>
          <p className="text-[#B8B8B8]">Intenta con otra búsqueda o categoría</p>
        </div>
      )}
    </div>
  );
} 