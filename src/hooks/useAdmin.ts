'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAdmin() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const hasRedirected = useRef(false);

  const fetchAdmin = useCallback((storedToken: string) => {
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.admin) {
          setAdmin(data.admin);
          setToken(storedToken);
        } else if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.push('/admin/login');
        }
      })
      .catch(() => {
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.push('/admin/login');
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    if (!storedToken) {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.push('/admin/login');
      }
      return;
    }
    fetchAdmin(storedToken);
  }, [router, fetchAdmin]);

  return { admin, loading, token };
}
