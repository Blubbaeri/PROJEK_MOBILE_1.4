// File: Models/types.ts
export interface Equipment {
	id: string;
	name: string;
	description: string;
	qty: number;
	available: number;
	image: string; // Bisa URL atau require local
	category: string;
}

export interface CartItem extends Equipment {
	qtyInCart: number;
}

export interface Transaction {
	id: string;
	status: 'Active' | 'Completed' | 'Booking';
	items: CartItem[];
	date: string;
	dueDate?: string;
}