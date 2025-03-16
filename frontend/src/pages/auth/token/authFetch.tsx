// authFetch.tsx
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
 
  
  // Always include credentials to ensure cookies are sent with the request
  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    }
  };

 

  try {
    const response = await fetch(url, fetchOptions);
    
    if (response.ok) {
     
    } else {
      console.error('❌ authFetch: Request failed', {
        status: response.status,
        statusText: response.statusText
      });
    }
    
    return response;
  } catch (error) {
    console.error('💥 authFetch: Network error', error);
    throw error;
  }
};