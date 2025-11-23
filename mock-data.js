// Mock data for demonstration
const mockPosts = [
    {
        id: 1,
        title: "Just learned React and it's amazing!",
        content: "After years of jQuery, React feels like magic. The component-based architecture makes so much sense.",
        author: "dev_guru",
        community: "programming",
        score: 42,
        comment_count: 8,
        created_at: "2024-01-15T10:30:00Z"
    },
    {
        id: 2,
        title: "What's your favorite game of 2024 so far?",
        content: "I've been playing Baldur's Gate 3 and it's absolutely incredible. The storytelling is next level.",
        author: "gamer_42",
        community: "gaming",
        score: 28,
        comment_count: 15,
        created_at: "2024-01-14T18:45:00Z"
    },
    {
        id: 3,
        title: "Dune: Part Two was worth the wait",
        content: "Just saw it in IMAX. Visuals are stunning and the cast delivers incredible performances.",
        author: "movie_buff",
        community: "movies",
        score: 35,
        comment_count: 12,
        created_at: "2024-01-14T22:15:00Z"
    }
];

const mockUsers = [
    {
        id: 1,
        username: "dev_guru",
        email: "dev@example.com",
        password: "password123"
    }
];

// Local storage keys
const STORAGE_KEYS = {
    POSTS: 'fedit_posts',
    USERS: 'fedit_users',
    SESSION: 'fedit_session'
};

// Initialize mock data
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(mockPosts));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
    }
}

// API simulation
const api = {
    // Posts
    getPosts() {
        const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
        return Promise.resolve(posts);
    },

    createPost(post) {
        const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
        const newPost = {
            ...post,
            id: Date.now(),
            score: 0,
            comment_count: 0,
            created_at: new Date().toISOString()
        };
        posts.unshift(newPost);
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
        return Promise.resolve(newPost);
    },

    vote(postId, voteType) {
        const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.score += voteType;
            localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
        }
        return Promise.resolve(post);
    },

    // Auth
    login(username, password) {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const session = { username: user.username, id: user.id };
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
            return Promise.resolve(session);
        }
        return Promise.reject('Invalid credentials');
    },

    register(username, email, password) {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const userExists = users.find(u => u.username === username || u.email === email);
        if (userExists) {
            return Promise.reject('User already exists');
        }
        
        const newUser = {
            id: Date.now(),
            username,
            email,
            password
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        const session = { username: newUser.username, id: newUser.id };
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
        return Promise.resolve(session);
    },

    logout() {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        return Promise.resolve();
    },

    getSession() {
        const session = localStorage.getItem(STORAGE_KEYS.SESSION);
        return Promise.resolve(session ? JSON.parse(session) : null);
    }
};
