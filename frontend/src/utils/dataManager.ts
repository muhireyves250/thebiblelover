// Data Manager for syncing dashboard changes with deployed site
import siteData from '../data/siteData.json';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  slug: string;
  imageUrl: string;
  subtitle?: string;
  views?: number;
  likes?: number;
  comments?: number;
}

export interface Donation {
  id: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorMessage: string;
  timestamp: string;
  date: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

export interface BackgroundSettings {
  imageUrl: string;
  opacity: number;
  overlayColor: string;
}

export interface LogoSettings {
  logoUrl: string;
  logoText: string;
  showText: boolean;
}

export interface SocialSettings {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
}

export interface SiteData {
  blogPosts: BlogPost[];
  donations: Donation[];
  contactMessages: ContactMessage[];
  backgroundSettings: BackgroundSettings;
  logoSettings: LogoSettings;
  socialSettings: SocialSettings;
}

class DataManager {
  private static instance: DataManager;
  private siteData: SiteData;

  constructor() {
    // Initialize with default data from JSON file
    this.siteData = siteData as SiteData;
    this.loadFromLocalStorage();
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // Load data from localStorage and merge with default data
  private loadFromLocalStorage(): void {
    try {
      // Load blog posts
      const storedPosts = localStorage.getItem('blogPosts');
      if (storedPosts) {
        this.siteData.blogPosts = JSON.parse(storedPosts);
      }

      // Load donations
      const storedDonations = localStorage.getItem('donations');
      if (storedDonations) {
        this.siteData.donations = JSON.parse(storedDonations);
      }

      // Load contact messages
      const storedMessages = localStorage.getItem('contactMessages');
      if (storedMessages) {
        this.siteData.contactMessages = JSON.parse(storedMessages);
      }

      // Load background settings
      const storedBackground = localStorage.getItem('backgroundSettings');
      if (storedBackground) {
        this.siteData.backgroundSettings = { ...this.siteData.backgroundSettings, ...JSON.parse(storedBackground) };
      }

      // Load logo settings
      const storedLogo = localStorage.getItem('logoSettings');
      if (storedLogo) {
        this.siteData.logoSettings = { ...this.siteData.logoSettings, ...JSON.parse(storedLogo) };
      }

      // Load social settings
      const storedSocial = localStorage.getItem('socialSettings');
      if (storedSocial) {
        this.siteData.socialSettings = { ...this.siteData.socialSettings, ...JSON.parse(storedSocial) };
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }

  // Get all site data
  getSiteData(): SiteData {
    return this.siteData;
  }

  // Get blog posts
  getBlogPosts(): BlogPost[] {
    return this.siteData.blogPosts;
  }

  // Add blog post
  addBlogPost(post: BlogPost): void {
    this.siteData.blogPosts.push(post);
    this.saveToLocalStorage('blogPosts', this.siteData.blogPosts);
    this.exportToFile();
  }

  // Update blog post
  updateBlogPost(id: string, updatedPost: BlogPost): void {
    const index = this.siteData.blogPosts.findIndex(post => post.id === id);
    if (index !== -1) {
      this.siteData.blogPosts[index] = updatedPost;
      this.saveToLocalStorage('blogPosts', this.siteData.blogPosts);
      this.exportToFile();
    }
  }

  // Delete blog post
  deleteBlogPost(id: string): void {
    this.siteData.blogPosts = this.siteData.blogPosts.filter(post => post.id !== id);
    this.saveToLocalStorage('blogPosts', this.siteData.blogPosts);
    this.exportToFile();
  }

  // Get donations
  getDonations(): Donation[] {
    return this.siteData.donations;
  }

  // Add donation
  addDonation(donation: Donation): void {
    this.siteData.donations.push(donation);
    this.saveToLocalStorage('donations', this.siteData.donations);
    this.exportToFile();
  }

  // Get contact messages
  getContactMessages(): ContactMessage[] {
    return this.siteData.contactMessages;
  }

  // Add contact message
  addContactMessage(message: ContactMessage): void {
    this.siteData.contactMessages.push(message);
    this.saveToLocalStorage('contactMessages', this.siteData.contactMessages);
    this.exportToFile();
  }

  // Get background settings
  getBackgroundSettings(): BackgroundSettings {
    return this.siteData.backgroundSettings;
  }

  // Update background settings
  updateBackgroundSettings(settings: BackgroundSettings): void {
    this.siteData.backgroundSettings = settings;
    this.saveToLocalStorage('backgroundSettings', settings);
    this.exportToFile();
  }

  // Get logo settings
  getLogoSettings(): LogoSettings {
    return this.siteData.logoSettings;
  }

  // Update logo settings
  updateLogoSettings(settings: LogoSettings): void {
    this.siteData.logoSettings = settings;
    this.saveToLocalStorage('logoSettings', settings);
    this.exportToFile();
  }

  // Get social settings
  getSocialSettings(): SocialSettings {
    return this.siteData.socialSettings;
  }

  // Update social settings
  updateSocialSettings(settings: SocialSettings): void {
    this.siteData.socialSettings = settings;
    this.saveToLocalStorage('socialSettings', settings);
    this.exportToFile();
  }

  // Save to localStorage
  private saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  // Export data to downloadable JSON file
  exportToFile(): void {
    try {
      const dataStr = JSON.stringify(this.siteData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'siteData.json';
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log('Site data exported to siteData.json');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }

  // Import data from JSON file
  importFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string) as SiteData;
          
          // Validate and merge data
          if (importedData.blogPosts) {
            this.siteData.blogPosts = importedData.blogPosts;
            this.saveToLocalStorage('blogPosts', this.siteData.blogPosts);
          }
          
          if (importedData.donations) {
            this.siteData.donations = importedData.donations;
            this.saveToLocalStorage('donations', this.siteData.donations);
          }
          
          if (importedData.contactMessages) {
            this.siteData.contactMessages = importedData.contactMessages;
            this.saveToLocalStorage('contactMessages', this.siteData.contactMessages);
          }
          
          if (importedData.backgroundSettings) {
            this.siteData.backgroundSettings = importedData.backgroundSettings;
            this.saveToLocalStorage('backgroundSettings', this.siteData.backgroundSettings);
          }
          
          if (importedData.logoSettings) {
            this.siteData.logoSettings = importedData.logoSettings;
            this.saveToLocalStorage('logoSettings', this.siteData.logoSettings);
          }
          
          if (importedData.socialSettings) {
            this.siteData.socialSettings = importedData.socialSettings;
            this.saveToLocalStorage('socialSettings', this.siteData.socialSettings);
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

export default DataManager;

