import { SearchResult, ImageResult, VideoResult, Settings } from '../types';

export const searchGoogle = async (query: string, settings: Settings): Promise<SearchResult[]> => {
  if (!settings.serperKey) {
    throw new Error('API Key for Serper is missing. Please check settings.');
  }

  const myHeaders = new Headers();
  myHeaders.append("X-API-KEY", settings.serperKey);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    q: query,
    gl: settings.country,
    hl: settings.language
  });

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  try {
    const response = await fetch("https://google.serper.dev/search", requestOptions);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch search results');
    }

    const result = await response.json();
    
    if (!result.organic) {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.organic.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      date: item.date,
      position: item.position
    })).slice(0, 10); // Limit to top 10

  } catch (error) {
    console.error("Serper API Error:", error);
    throw error;
  }
};

export const searchGoogleImages = async (query: string, settings: Settings): Promise<ImageResult[]> => {
  if (!settings.serperKey) {
     return []; // Fail silently for images if key missing, or handle upstream
  }

  const myHeaders = new Headers();
  myHeaders.append("X-API-KEY", settings.serperKey);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    q: query,
    gl: settings.country,
    hl: settings.language,
    num: 10 // Limit request to 10 images
  });

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  try {
    const response = await fetch("https://google.serper.dev/images", requestOptions);

    if (!response.ok) {
      console.warn('Image search failed');
      return [];
    }

    const result = await response.json();

    if (!result.images) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.images.map((item: any) => ({
      title: item.title,
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl,
      source: item.source,
      link: item.link,
      width: item.width,
      height: item.height
    }));

  } catch (error) {
    console.error("Serper Image API Error:", error);
    return [];
  }
};

export const searchGoogleVideos = async (query: string, settings: Settings): Promise<VideoResult[]> => {
  if (!settings.serperKey) {
    return [];
  }

  const myHeaders = new Headers();
  myHeaders.append("X-API-KEY", settings.serperKey);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    q: query,
    gl: settings.country,
    hl: settings.language,
    num: 10
  });

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  try {
    const response = await fetch("https://google.serper.dev/videos", requestOptions);

    if (!response.ok) {
      console.warn('Video search failed');
      return [];
    }

    const result = await response.json();

    if (!result.videos) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.videos.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      imageUrl: item.imageUrl,
      date: item.date,
      source: item.source,
      duration: item.duration
    }));

  } catch (error) {
    console.error("Serper Video API Error:", error);
    return [];
  }
};