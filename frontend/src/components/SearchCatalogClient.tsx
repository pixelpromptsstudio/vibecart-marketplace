'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productApi, categoryApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/ProductSkeleton';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SearchCatalogClientProps {
  initialCategories?: any[];
}

export function SearchCatalogClient({
  initialCategories = [],
}: SearchCatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialBrand = searchParams.get('brand') || 'all';
  const initialTrending = searchParams.get('trending') === 'true';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [trendingOnly, setTrendingOnly] = useState(initialTrending);
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedBrand(searchParams.get('brand') || 'all');
    setTrendingOnly(searchParams.get('trending') === 'true');
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    if (categories.length > 0) return;
    categoryApi
      .getCategories()
      .then((res) => {
        if (res && res.categories) setCategories(res.categories);
      })
      .catch(() => undefined);
  }, [categories.length]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: 12,
        sort: sortBy,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedBrand !== 'all') params.brand = selectedBrand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.rating = minRating;
      if (inStockOnly) params.inStock = 'true';
      if (trendingOnly) params.trending = 'true';

      const res = await productApi.getProducts(params);
      if (res && res.products) {
        setProducts(res.products);
        setTotal(res.pagination?.total || res.products.length);
        setTotalPages(Math.max(1, res.pagination?.totalPages || 1));
      }
    } catch (err) {
      console.error('Failed to search products:', err);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    sortBy,
    searchQuery,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    trendingOnly,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setInStockOnly(false);
    setTrendingOnly(false);
    setSortBy('createdAt');
    setPage(1);
    router.push('/search');
  };

  return (
    <div className="container" style={{ paddingBlock: '24px 64px' }}>
      <Breadcrumbs
        items={[
          { label: searchQuery ? `Search: ${searchQuery}` : 'Marketplace Catalog' },
        ]}
      />

      {/* Top Results Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '22px',
          padding: '18px 22px',
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 800, color: '#0F172A' }}>
            {searchQuery
              ? `Results for "${searchQuery}"`
              : trendingOnly
              ? 'Trending Marketplace Drops'
              : selectedCategory !== 'all'
              ? `${selectedCategory.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`
              : 'All Marketplace Products'}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            {loading ? 'Searching curated inventory...' : `${total} verified listings found`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="btn-pill-outline mobile-filter-toggle"
          >
            <SlidersHorizontal size={15} />
            <span>{mobileFiltersOpen ? 'Hide Filters' : 'Filters'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={15} color="#64748B" />
            <label htmlFor="catalog-sort" style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
              Sort:
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-default)',
                fontWeight: 700,
                fontSize: '13px',
                backgroundColor: '#F8FAFC',
                color: '#0F172A',
              }}
            >
              <option value="createdAt">Newest First</option>
              <option value="popular">Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Split Filters + Product Grid */}
      <div className="search-catalog-grid">
        <aside
          className={`search-sidebar-panel ${mobileFiltersOpen ? 'open' : ''}`}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid var(--border-default)',
            padding: '20px',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
              <SlidersHorizontal size={17} />
              <span>Filters</span>
            </div>
            <button
              type="button"
              onClick={clearAllFilters}
              style={{ fontSize: '12px', color: '#4F46E5', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <X size={13} /> Clear All
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
              Categories
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setPage(1);
                }}
                style={{
                  textAlign: 'left',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: selectedCategory === 'all' ? 700 : 500,
                  backgroundColor: selectedCategory === 'all' ? '#EEF2FF' : 'transparent',
                  color: selectedCategory === 'all' ? '#4338CA' : '#334155',
                }}
              >
                All Departments
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setPage(1);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '7px 12px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: selectedCategory === cat.slug ? 700 : 500,
                    backgroundColor: selectedCategory === cat.slug ? '#EEF2FF' : 'transparent',
                    color: selectedCategory === cat.slug ? '#4338CA' : '#334155',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px', borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
              Price Range (₹)
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="filter-min-price"
                name="minPrice"
                type="number"
                min={0}
                placeholder="Min ₹"
                aria-label="Minimum price"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                style={{ width: '50%', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--border-default)', fontSize: '12px' }}
              />
              <input
                id="filter-max-price"
                name="maxPrice"
                type="number"
                min={0}
                placeholder="Max ₹"
                aria-label="Maximum price"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                style={{ width: '50%', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--border-default)', fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px', borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
              Customer Rating
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[4.5, 4.0, 3.5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setMinRating(minRating === String(r) ? '' : String(r));
                    setPage(1);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: minRating === String(r) ? 700 : 500,
                    backgroundColor: minRating === String(r) ? '#ECFDF5' : 'transparent',
                    color: minRating === String(r) ? '#047857' : '#334155',
                  }}
                >
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span>{r}★ &amp; above</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor="filter-in-stock" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <input
                id="filter-in-stock"
                name="inStockOnly"
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
              />
              <span>In Stock Items Only</span>
            </label>

            <label htmlFor="filter-trending" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <input
                id="filter-trending"
                name="trendingOnly"
                type="checkbox"
                checked={trendingOnly}
                onChange={(e) => {
                  setTrendingOnly(e.target.checked);
                  setPage(1);
                }}
              />
              <span>Trending Drops Only</span>
            </label>
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="product-catalog-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="state-empty-card">
              <div className="state-empty-badge">NO MATCHES</div>
              <h2 className="state-empty-title">No products match your filters</h2>
              <p className="state-empty-copy">
                Try clearing a price ceiling, loosening your rating threshold, or exploring all categories.
              </p>
              <button type="button" onClick={clearAllFilters} className="btn-pill-dark">
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-catalog-grid">
                {products.map((product, idx) => (
                  <ProductCard key={product._id} product={product} priorityImage={idx < 4} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="pagination-bar" aria-label="Catalog pagination">
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`pagination-btn ${pageNum === page ? 'active' : ''}`}
                      onClick={() => setPage(pageNum)}
                      aria-current={pageNum === page ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
