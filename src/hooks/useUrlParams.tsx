import { useState, useEffect, useCallback, useMemo } from 'react';

type SetSearchParamsType = (newParams: string | ((p: URLSearchParams) => string), options?: {
    replace: boolean;
}) => void;

export function useSearchParams(): [URLSearchParams, SetSearchParamsType] {
  const [searchString, setSearchString] = useState(() => window.location.search);

  useEffect(() => {
    const handleUrlChange = () => {
      setSearchString(window.location.search);
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleUrlChange(); 
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleUrlChange(); 
    };

    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const searchParams = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const setSearchParams = useCallback((newParams: string | ((p: URLSearchParams) => string), options = { replace: false }) => {
    const nextParams = new URLSearchParams(
      typeof newParams === 'function' ? newParams(searchParams) : newParams
    );
    
    const nextSearch = nextParams.toString();
    const newUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;

    if (options.replace) {
      window.history.replaceState(null, '', newUrl);
    } else {
      window.history.pushState(null, '', newUrl);
    }
  }, [searchParams]);

  return [searchParams, setSearchParams];
}
