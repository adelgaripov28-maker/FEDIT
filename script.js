class FEDITApp {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        initializeData();
        await this.checkAuth();
        this.setupEventListeners();
        
        if (window.location.pathname.includes('index.html') || 
            window.location.pathname === '/') {
            this.loadPosts();
        }
    }

    async checkAuth() {
        try {
            this.currentUser = await api.getSession();
            this.updateUI();
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }

    updateUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const usernameSpan = document.getElementById('username');

        if (this.currentUser) {
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            if (usernameSpan) usernameSpan.textContent = this.currentUser.username;
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Create post form
        const createPostForm = document.getElementById('create-post-form');
        if (createPostForm) {
            createPostForm.addEventListener('submit', (e) => this.handleCreatePost(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        try {
            await api.login(
                formData.get('username'),
                formData.get('password')
            );
            await this.checkAuth();
            this.showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            this.showMessage('Login failed: ' + error, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        if (formData.get('password') !== formData.get('confirm_password')) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        try {
            await api.register(
                formData.get('username'),
                formData.get('email'),
                formData.get('password')
            );
            await this.checkAuth();
            this.showMessage('Registration successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            this.showMessage('Registration failed: ' + error, 'error');
        }
    }

    async handleCreatePost(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showMessage('Please login to create posts', 'error');
            return;
        }

        const form = e.target;
        const formData = new FormData(form);
        
        try {
            await api.createPost({
                title: formData.get('title'),
                content: formData.get('content'),
                author: this.currentUser.username,
                community: formData.get('community')
            });
            
            this.showMessage('Post created successfully!', 'success');
            form.reset();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            this.showMessage('Failed to create post', 'error');
        }
    }

    async handleLogout() {
        try {
            await api.logout();
            this.currentUser = null;
            this.updateUI();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    async loadPosts() {
        const container = document.getElementById('posts-container');
        if (!container) return;

        try {
            const posts = await api.getPosts();
            this.displayPosts(posts);
        } catch (error) {
            container.innerHTML = '<div class="message error">Failed to load posts</div>';
        }
    }

    displayPosts(posts) {
        const container = document.getElementById('posts-container');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = '<div class="message">No posts yet. Be the first to post!</div>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="post">
                <div class="post-header">
                    <span class="post-community">r/${post.community}</span>
                    <span class="post-author">Posted by u/${post.author}</span>
                    <span class="post-time">${this.formatTime(post.created_at)}</span>
                </div>
                <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                <div class="post-content">${this.escapeHtml(post.content)}</div>
                <div class="post-footer">
                    <div class="vote-buttons">
                        <button class="vote-btn upvote" data-post-id="${post.id}">▲</button>
                        <span class="vote-count">${post.score}</span>
                        <button class="vote-btn downvote" data-post-id="${post.id}">▼</button>
                    </div>
                    <span class="comments">${post.comment_count} comments</span>
                </div>
            </div>
        `).join('');

        // Add vote listeners
        container.querySelectorAll('.upvote').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.target.dataset.postId);
                this.handleVote(postId, 1);
            });
        });

        container.querySelectorAll('.downvote').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.target.dataset.postId);
                this.handleVote(postId, -1);
            });
        });
    }

    async handleVote(postId, voteType) {
        if (!this.currentUser) {
            alert('Please login to vote');
            return;
        }

        try {
            await api.vote(postId, voteType);
            this.loadPosts(); // Reload to update scores
        } catch (error) {
            console.error('Vote failed:', error);
        }
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.className = `message ${type}`;
        }
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.feditApp = new FEDITApp();
});
