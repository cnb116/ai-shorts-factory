/**
 * Mock Video Data
 * 
 * How to add a new video:
 * Copy the block below and paste it into the 'mockVideos' array.
 * 
 * {
 *     id: 4, // Unique ID
 *     url: "VIDEO_URL_HERE",
 *     title: "Video Title",
 *     description: "Video Description",
 *     likes: 0,
 *     comments: 0,
 *     user: {
 *         name: "username",
 *         avatar: "AVATAR_URL"
 *     },
 *     product: {
 *         id: "prod_004", // Unique Product ID
 *         name: "Product Name",
 *         price: "Price",
 *         image: "PRODUCT_IMAGE_URL",
 *         promoText: "Promo Text (Optional)" // e.g., "🔥 Hot Sale"
 *     }
 * }
 */

export const mockVideos = [
    {
        id: 0,
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Reliable sample video
        title: '원룸 마법템? 1초 만에 침대 되는 소파!',
        description: '친구와 함께 쓰기 딱 좋아요 #자취꿀템 #소파베드',
        likes: 3420,
        comments: 128,
        product: {
            id: 'prod_new_01',
            name: '티야드 접이식 소파베드 2 인용 쇼파',
            price: '79,800 원',
            image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80', // Sofa image
            promoText: '🔥 핫딜'
        },
        user: {
            name: '자취만렙',
            avatar: 'https://i.pravatar.cc/150?u=sofa'
        }
    },
    {
        id: 1,
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        title: 'Neon Vibes Hoodie',
        description: 'Glow in the dark with our new collection! ✨ #fashion #neon',
        likes: 1205,
        comments: 45,
        product: {
            id: 'prod_001',
            name: 'Neon Glow Hoodie',
            price: '₩45,000',
            image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
            promoText: '🔥 Hot Sale'
        },
        user: {
            name: 'StyleHunter',
            avatar: 'https://i.pravatar.cc/150?u=1'
        }
    },
    {
        id: 2,
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        title: 'Spring Collection 🌸',
        description: 'Get ready for the blooming season. Limited edition.',
        likes: 856,
        comments: 23,
        product: {
            id: 'prod_002',
            name: 'Floral Dress',
            price: '₩79,000',
            image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
            promoText: '⭐ 100+ Reviews'
        },
        user: {
            name: 'Fashionista',
            avatar: 'https://i.pravatar.cc/150?u=2'
        }
    },
    {
        id: 3,
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        title: 'Cozy Winter Wear',
        description: 'Stay warm and stylish this winter. ❄️',
        likes: 2341,
        comments: 112,
        product: {
            id: 'prod_003',
            name: 'Wool Scarf',
            price: '₩29,000',
            image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=600&q=80'
        },
        user: {
            name: 'CozyCorner',
            avatar: 'https://i.pravatar.cc/150?u=3'
        }
    },
    {
        id: 4,
        url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', // Construction/Safety related placeholder
        title: '입자마자 -5도? ❄️ 3M 쿨링 안전 조끼',
        description: '얼음팩 4개로 하루종일 시원하게! 가볍고 통기성 최고 🌬️ #현장필수템 #여름작업복',
        likes: 520,
        comments: 18,
        product: {
            id: 'prod_3m_cool',
            name: '3M 쿨링 안전 조끼 (얼음팩 4개 포함)',
            price: '₩45,000',
            image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80', // Safety vest placeholder
            promoText: '❄️ -5도 효과'
        },
        user: {
            name: 'SafetyPro',
            avatar: 'https://i.pravatar.cc/150?u=safety'
        }
    }
];
