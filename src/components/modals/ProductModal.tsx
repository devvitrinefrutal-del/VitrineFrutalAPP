import React, { useState, useEffect } from 'react';
import { PlusCircle, ImageIcon } from 'lucide-react';
import { Product } from '../../types';
import { Modal } from '../ui/Modal';
import { MultiImageInput } from '../ui/MultiImageInput';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
    onSave: (formData: FormData, images: string[]) => Promise<boolean>;
    showError: (msg: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    product,
    onSave,
    showError
}) => {
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setUploadedImages(product?.images || []);
        }
    }, [isOpen, product]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const success = await onSave(formData, uploadedImages);
        setIsSaving(false);
        if (success) onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={<><PlusCircle className="text-orange-500" /> {product ? 'Editar Oferta' : 'Novo Item na Vitrine'}</>}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <input
                    required name="name"
                    defaultValue={product?.name}
                    placeholder="Nome do Produto Local"
                    className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-50 border-2 border-transparent transition-all"
                />
                <div className="grid grid-cols-2 gap-5">
                    <input
                        required name="price"
                        type="number"
                        step="0.01"
                        defaultValue={product?.price}
                        placeholder="Preço em R$"
                        className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-50 border-2 border-transparent transition-all"
                    />
                    <input
                        required name="stock"
                        type="number"
                        defaultValue={product?.stock}
                        placeholder="Quantidade"
                        className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-semibold text-black focus:ring-4 focus:ring-orange-50 border-2 border-transparent transition-all"
                    />
                </div>
                <textarea
                    required name="description"
                    defaultValue={product?.description}
                    placeholder="Descreva as características principais..."
                    className="w-full p-5 bg-gray-50 rounded-2xl outline-none h-24 font-semibold resize-none text-black focus:ring-4 focus:ring-orange-50 border-2 border-transparent transition-all"
                />

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-[0.3em] flex items-center gap-2">
                        <ImageIcon size={14} className="text-orange-500" /> Fotos do Produto (Máx 5)
                    </label>
                    <MultiImageInput
                        max={5}
                        onImagesChange={setUploadedImages}
                        initialImages={product?.images || []}
                        showError={showError}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-6 bg-orange-500 text-white font-black rounded-3xl shadow-2xl mt-6 active:scale-95 uppercase tracking-[0.4em] text-[10px] disabled:opacity-70"
                >
                    {isSaving ? 'Salvando...' : 'Concluir Cadastro'}
                </button>
            </form>
        </Modal>
    );
};
