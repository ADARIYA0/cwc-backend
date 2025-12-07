export interface LoginDTO {
    email: string;
    password: string;
}

export interface LoginResponseDTO {
    user: {
        id: string;
        email: string;
        fullName: string;
        accountType: string;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresAt: string;
        refreshTokenExpiresAt: string;
    };
}

export interface DeviceInfo {
    device: string;
    ipAddress: string;
    userAgent: string;
}

export interface RefreshTokenDTO {
    refreshToken: string;
}

export interface RefreshTokenResponseDTO {
    accessToken: string;
    accessTokenExpiresAt: string;
}
