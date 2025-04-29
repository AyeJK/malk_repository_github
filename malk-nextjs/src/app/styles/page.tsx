import React from 'react';

export default function StylesPage() {
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Malk.tv Visual Stylesheet</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Typography</h2>
        <div className="space-y-4">
          <h1 className="text-4xl">Heading 1</h1>
          <h2 className="text-3xl">Heading 2</h2>
          <h3 className="text-2xl">Heading 3</h3>
          <h4 className="text-xl">Heading 4</h4>
          <h5 className="text-lg">Heading 5</h5>
          <h6 className="text-base">Heading 6</h6>
          <p className="text-base">Regular paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.</p>
          <p className="text-sm">Small text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p className="text-xs">Extra small text. Lorem ipsum dolor sit amet.</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="follow-button follow-button-following">Following</button>
            <button className="follow-button follow-button-not-following">Follow</button>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Cards</h2>
        <div className="grid-feed">
          <div className="card p-4">
            <div className="video-thumbnail mb-4">
              <div className="w-full h-40 bg-white/10"></div>
            </div>
            <div className="video-info">
              <h3 className="video-title">Sample Video Title</h3>
              <p className="video-meta">Posted by User • 2 days ago</p>
            </div>
          </div>
          <div className="card p-4">
            <div className="video-thumbnail mb-4">
              <div className="w-full h-40 bg-white/10"></div>
            </div>
            <div className="video-info">
              <h3 className="video-title">Another Sample Video Title</h3>
              <p className="video-meta">Posted by User • 1 week ago</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Form Elements</h2>
        <div className="space-y-4 max-w-md">
          <input type="text" className="input-primary w-full" placeholder="Text input" />
          <select className="input-primary w-full">
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
          <div className="search-bar">
            <span>🔍</span>
            <input type="text" className="bg-transparent border-none outline-none w-full" placeholder="Search..." />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <a href="#" className="nav-link">Inactive Link</a>
            <a href="#" className="nav-link-active">Active Link</a>
          </div>
          <div className="tab-nav">
            <button className="tab-item">Tab 1</button>
            <button className="tab-item-active">Tab 2</button>
            <button className="tab-item">Tab 3</button>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Interactive Elements</h2>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <button className="like-button">
              <span>❤️</span>
              <span>Like</span>
            </button>
            <button className="share-button">
              <span>↗️</span>
              <span>Share</span>
            </button>
          </div>
          <div className="user-avatar w-12 h-12 bg-white/20"></div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Loading States</h2>
        <div className="space-y-4">
          <div className="loading-skeleton h-40 w-full"></div>
          <div className="loading-skeleton h-10 w-3/4"></div>
          <div className="loading-skeleton h-10 w-1/2"></div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <div className="comments-section">
          <div className="comment">
            <div className="flex items-center space-x-2 mb-2">
              <div className="user-avatar w-8 h-8 bg-white/20"></div>
              <span className="font-medium">User Name</span>
              <span className="text-white/50 text-sm">2 days ago</span>
            </div>
            <p>This is a sample comment. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="comment">
            <div className="flex items-center space-x-2 mb-2">
              <div className="user-avatar w-8 h-8 bg-white/20"></div>
              <span className="font-medium">Another User</span>
              <span className="text-white/50 text-sm">1 day ago</span>
            </div>
            <p>Another sample comment. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Modals & Notifications</h2>
        <div className="space-y-4">
          <div className="modal-content">
            <h3 className="text-xl font-bold mb-4">Sample Modal</h3>
            <p className="mb-4">This is a sample modal content. It demonstrates the styling of modal dialogs.</p>
            <div className="flex justify-end space-x-2">
              <button className="btn-secondary">Cancel</button>
              <button className="btn-primary">Confirm</button>
            </div>
          </div>
          <div className="toast">Sample toast notification</div>
        </div>
      </section>
    </div>
  );
} 