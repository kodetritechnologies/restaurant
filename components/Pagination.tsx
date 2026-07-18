"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PaginationContent = ({ data, isAdmin = false }: any) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!data || data.totalPages <= 1) return null;

  const currentPage = data.currentPage || data.page;
  const totalPages = data.totalPages;

  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${isAdmin ? "" : "mt-20"}`}>
      <button
        disabled={!hasPrevPage}
        onClick={() => prevPage && changePage(prevPage)}
        className={isAdmin
          ? "px-3 py-1.5 text-xs rounded border border-foreground/10 bg-foreground/5 text-foreground hover:bg-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          : "w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 text-[#064268] hover:bg-[#064268] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
        }
      >
        {isAdmin ? "Previous" : <ChevronLeft size={20} />}
      </button>

      <div className="flex items-center gap-1 sm:gap-2">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => changePage(page)}
            className={isAdmin
              ? `px-3 py-1.5 text-xs rounded border transition-colors ${
                  currentPage === page
                    ? "border-gold bg-gold text-primary-foreground font-bold shadow-gold"
                    : "border-foreground/10 bg-foreground/5 text-foreground hover:bg-foreground/10"
                }`
              : `w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentPage === page
                    ? "bg-[#064268] text-white shadow-lg shadow-[#064268]/20"
                    : "bg-white border border-gray-100 text-[#064268] hover:border-[#4DB7FF] hover:text-[#4DB7FF]"
                }`
            }
          >
            {page}
          </button>
        ))}
      </div>

      <button
        disabled={!hasNextPage}
        onClick={() => nextPage && changePage(nextPage)}
        className={isAdmin
          ? "px-3 py-1.5 text-xs rounded border border-foreground/10 bg-foreground/5 text-foreground hover:bg-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          : "w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 text-[#064268] hover:bg-[#064268] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
        }
      >
        {isAdmin ? "Next" : <ChevronRight size={20} />}
      </button>
    </div>
  );
};

const Pagination = (props: any) => {
  return (
    <Suspense fallback={<div className="h-10 w-full flex items-center justify-center"><span className="text-muted-foreground text-xs">...</span></div>}>
      <PaginationContent {...props} />
    </Suspense>
  );
};

export default Pagination;
