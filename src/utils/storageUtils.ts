export interface ImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'origin';
    resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Gera uma URL otimizada usando o serviço de transformação de imagens do Supabase.
 * Se a URL não for do Supabase, retorna a URL original.
 * 
 * @param url URL original da imagem no Supabase Storage
 * @param options Opções de transformação (largura, altura, qualidade, etc.)
 * @returns URL transformada ou URL original
 */
export const getOptimizedImageUrl = (url: string | undefined, options: ImageOptions = {}) => {
    if (!url) return '';

    // Só aplica para URLs do Supabase (contendo .supabase.co)
    // E que estejam no formato de objetos públicos
    if (!url.includes('supabase.co') || !url.includes('/storage/v1/object/public/')) {
        return url;
    }

    const {
        width,
        height,
        quality = 70, // Qualidade 70 economiza bastante sem perda visual significativa
        format = 'webp',
        resize = 'cover'
    } = options;

    // Troca o endpoint de 'object/public' para 'render/image/public'
    let optimizedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');

    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    params.append('format', format);
    params.append('resize', resize);

    return `${optimizedUrl}?${params.toString()}`;
};
