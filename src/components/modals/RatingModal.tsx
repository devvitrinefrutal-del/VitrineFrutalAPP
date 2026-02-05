import React, { useState } from 'react';
import { Star, MessageSquare, X } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<boolean>;
    storeName: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    storeName
}) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await onSubmit(rating, comment);
        setIsSubmitting(false);
        if (success) onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Avaliar Experiência</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">O que achou da {storeName}?</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col items-center gap-4 py-8 bg-orange-50/30 rounded-[2.5rem] border border-orange-100">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transform transition-all active:scale-90 hover:scale-110"
                                >
                                    <Star
                                        size={40}
                                        fill={star <= rating ? "#f97316" : "transparent"}
                                        className={star <= rating ? "text-orange-500" : "text-gray-300"}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="font-black text-orange-600 uppercase tracking-widest text-[10px]">
                            {rating === 1 && "Péssimo 😞"}
                            {rating === 2 && "Ruim 😐"}
                            {rating === 3 && "Médio 🙂"}
                            {rating === 4 && "Muito Bom! 😊"}
                            {rating === 5 && "Excelente! ⭐"}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4 flex items-center gap-2">
                            <MessageSquare size={12} className="text-orange-500" /> Seu Comentário (Opcional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Conte como foi sua experiência com este pedido..."
                            className="w-full p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none transition-all font-medium text-gray-700 min-h-[120px] resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-orange-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </button>
                </form>
            </div>
        </Modal>
    );
};
