const modules = import.meta.glob(
    '@images/**/*.{png,jpg,jpeg,svg,webp,mp4,MOV}',
    {
        eager: true,
        import: 'default',
    }
)

export const images = Object.fromEntries(
    Object.entries(modules).map(([path, url]) => {
        const key = path
            .split('/')
            .pop()
            .replace(/\.[^/.]+$/, '')

        return [key, url]
    })
)