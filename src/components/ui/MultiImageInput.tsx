import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface MultiImageInputProps {
    max: number;
    initialImages: string[];
    onImagesChange: (images: string[]) => void;
    showError?: (msg: string) => void;
}

export const MultiImageInput: React.FC<MultiImageInputProps> = ({
    max,
    initialImages,
    onImagesChange,
    showError
}) => {
    const [images, setImages] = useState<string[]>(initialImages);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        const remaining = max - images.length;
        const toProcess = files.slice(0, remaining);

        for (const file of toProcess) {
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                showError?.(`Imagem "${file.name}" muito grande! Máximo: 2MB.`);
                e.target.value = '';
                return;
            }
            // Validate file format
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                showError?.(`Formato inválido em "${file.name}"! Use apenas JPG, PNG ou WebP.`);
                e.target.value = '';
                return;
            }
        }

        toProcess.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const b64 = reader.result as string;
                setImages(prev => {
                    const updated = [...prev, b64];
                    onImagesChange(updated);
                    return updated;
                });
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        const updated = images.filter((_, i) => i !== index);
        setImages(updated);
        onImagesChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-5 gap-3">
                {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square">
                        <img src={img} className="w-full h-full object-cover rounded-xl border border-gray-200" alt={`Upload ${idx}`} />
                        <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
                {images.length < max && (
                    <label className="aspect-square bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-100/50 transition-all group">
                        <Plus size={28} className="text-orange-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] font-black text-orange-400 uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Incluir</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFile} />
                    </label>
                )}
            </div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">
                {images.length} de {max} fotos adicionadas
            </p>
        </div>
    );
};
