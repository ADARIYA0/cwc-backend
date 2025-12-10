export interface CreateSubCategoryDTO {
    name: string;
}

export interface UpdateSubCategoryDTO {
    name: string;
}

export interface SubCategoryResponseDTO {
    id: string;
    storeId: string;
    name: string;
    isOwner: boolean;
    createdAt: Date;
    updatedAt: Date;
}
