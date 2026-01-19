import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@biblelover.com' },
    update: {},
    create: {
      email: 'admin@biblelover.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample blog posts
  const blogPosts = [
    {
      title: "8 Must-Read Books for Spiritual Growth",
      slug: "8-must-read-books",
      excerpt: "Discover these essential books that will deepen your faith and transform your spiritual journey. Each book offers unique insights into Christian living and biblical wisdom.",
      content: `# 8 Must-Read Books for Spiritual Growth

In our journey of faith, books serve as invaluable companions that guide us, challenge us, and help us grow closer to God. Here are eight essential books that every Christian should consider reading:

## 1. The Bible
The foundation of all Christian literature, the Bible is God's living word that speaks to every aspect of life.

## 2. Mere Christianity by C.S. Lewis
A classic work that presents the core beliefs of Christianity in a logical and accessible way.

## 3. The Purpose Driven Life by Rick Warren
A 40-day spiritual journey that helps believers discover their God-given purpose.

## 4. Knowing God by J.I. Packer
An in-depth exploration of God's character and attributes that will deepen your relationship with Him.

## 5. The Screwtape Letters by C.S. Lewis
A unique perspective on spiritual warfare through the eyes of a senior demon.

## 6. Celebration of Discipline by Richard Foster
A guide to spiritual disciplines that will transform your prayer life and spiritual practices.

## 7. The Cost of Discipleship by Dietrich Bonhoeffer
A powerful call to authentic Christian living and the true cost of following Jesus.

## 8. My Utmost for His Highest by Oswald Chambers
A daily devotional that provides spiritual nourishment and challenges believers to live for God's glory.

Each of these books offers unique insights and will help you grow in your faith journey. Take time to read them prayerfully and allow God to speak to you through their pages.`,
      featuredImage: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "FAITH",
      tags: ["books", "spiritual-growth", "christian-living", "reading"],
      status: "PUBLISHED",
      publishedAt: new Date('2024-01-15'),
      readTime: 8,
      views: 358,
      likes: 22,
      isFeatured: true,
      seoTitle: "8 Must-Read Books for Spiritual Growth - The Bible Lover",
      seoDescription: "Discover essential books for spiritual growth and Christian living. Transform your faith journey with these recommended reads."
    },
    {
      title: "You Want Your Child to Read These Books",
      slug: "you-want-your-child-to-read-these-books",
      excerpt: "Building a strong foundation of faith in children through carefully selected books that teach biblical values and Christian principles.",
      content: `# You Want Your Child to Read These Books

As Christian parents, we have the incredible responsibility of nurturing our children's faith from an early age. Books play a crucial role in this journey, helping us teach biblical values and Christian principles in engaging ways.

## Essential Books for Christian Children

### 1. The Jesus Storybook Bible by Sally Lloyd-Jones
This beautifully illustrated Bible presents every story as part of God's great rescue plan, showing children how Jesus is the hero of every story.

### 2. The Chronicles of Narnia by C.S. Lewis
A timeless series that introduces children to Christian themes through fantasy and adventure.

### 3. Little Pilgrim's Progress by Helen L. Taylor
A child-friendly version of John Bunyan's classic that teaches about the Christian journey.

### 4. The Prince Warriors by Priscilla Shirer
An exciting series that teaches children about spiritual warfare and the armor of God.

### 5. God's Very Good Idea by Trillia Newbell
A wonderful book that teaches children about God's love for diversity and inclusion.

## Building a Christian Library at Home

Creating a home library filled with Christian books is one of the best investments you can make in your child's spiritual development. These books will:

- Reinforce biblical values
- Provide positive role models
- Encourage critical thinking about faith
- Create opportunities for family discussions
- Build a foundation for lifelong learning

Start building your child's Christian library today and watch their faith grow stronger with each page they read.`,
      featuredImage: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "FAITH",
      tags: ["children", "parenting", "christian-education", "books"],
      status: "PUBLISHED",
      publishedAt: new Date('2024-01-10'),
      readTime: 6,
      views: 325,
      likes: 22,
      isFeatured: false,
      seoTitle: "Christian Books for Children - Building Faith Through Reading",
      seoDescription: "Essential Christian books for children that teach biblical values and build a strong foundation of faith."
    },
    {
      title: "The Traitor's Daughter - A Story of Redemption",
      slug: "the-traitors-daughter",
      excerpt: "Exploring themes of forgiveness, redemption, and God's grace through the lens of biblical storytelling and Christian fiction.",
      content: `# The Traitor's Daughter - A Story of Redemption

In the tapestry of biblical narratives, few themes are as powerful as redemption. The story of redemption runs throughout Scripture, showing us how God can transform even the most broken situations into stories of hope and restoration.

## The Power of Redemption in Scripture

The Bible is filled with stories of people who made mistakes, betrayed others, or found themselves in desperate situations, yet experienced God's redeeming love:

### Rahab the Prostitute
Once a woman of ill repute, Rahab became an ancestor of Jesus Christ through her faith and courage.

### David the Adulterer
Despite his moral failures, David was called "a man after God's own heart" and became Israel's greatest king.

### Peter the Denier
After denying Jesus three times, Peter was restored and became a pillar of the early church.

### Paul the Persecutor
Once a zealous persecutor of Christians, Paul became the greatest missionary and theologian in church history.

## Lessons for Today

These stories teach us that:

1. **No one is beyond redemption** - God's grace is sufficient for all
2. **Our past doesn't define our future** - God can use anyone for His purposes
3. **Forgiveness is always possible** - Through Christ, we can be made new
4. **God specializes in second chances** - His mercies are new every morning

## Embracing Your Own Story of Redemption

If you're struggling with guilt, shame, or feeling unworthy, remember that God's redemption is available to you. Just as He transformed the lives of biblical characters, He can transform yours too.

The traitor's daughter can become the redeemed child of God. Your story of redemption is waiting to be written.`,
      featuredImage: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "BIBLE_STUDY",
      tags: ["redemption", "forgiveness", "grace", "biblical-stories"],
      status: "PUBLISHED",
      publishedAt: new Date('2024-01-05'),
      readTime: 7,
      views: 314,
      likes: 23,
      isFeatured: false,
      seoTitle: "The Traitor's Daughter - Biblical Stories of Redemption",
      seoDescription: "Explore powerful stories of redemption in the Bible and discover how God's grace transforms lives."
    },
    {
      title: "How Reading Changes Your Perspective",
      slug: "how-reading-changes-your-perspective",
      excerpt: "Discover how reading Christian literature and the Bible can transform your worldview and deepen your understanding of God's truth.",
      content: `# How Reading Changes Your Perspective

Reading is more than just a pastime—it's a transformative experience that can reshape how we see the world, understand ourselves, and relate to God. For Christians, reading becomes a spiritual discipline that deepens our faith and broadens our perspective.

## The Transformative Power of Reading

### 1. Expanding Your Worldview
Books expose us to different cultures, experiences, and ways of thinking. They help us understand that our perspective is just one among many, fostering empathy and compassion.

### 2. Deepening Spiritual Understanding
Christian literature helps us explore complex theological concepts, understand biblical truths more deeply, and apply God's word to our daily lives.

### 3. Developing Critical Thinking
Reading challenges us to think critically about what we believe and why. It helps us develop a more mature, well-reasoned faith.

### 4. Building Empathy and Compassion
Through stories, we experience the lives of others, developing greater empathy and understanding for people different from ourselves.

## The Bible as the Ultimate Book

While all reading can be beneficial, the Bible holds a special place in the Christian's reading life:

- **It's God's living word** - It speaks to us in fresh ways each time we read it
- **It transforms our thinking** - It renews our minds and aligns our thoughts with God's truth
- **It guides our actions** - It provides wisdom for every situation we face
- **It reveals God's character** - It helps us know who God is and how He works

## Making Reading a Spiritual Discipline

To get the most from your reading:

1. **Read regularly** - Make it a daily habit
2. **Read prayerfully** - Ask God to speak to you through what you read
3. **Read reflectively** - Take time to think about what you've read
4. **Read selectively** - Choose books that will edify and strengthen your faith
5. **Read with others** - Join a book club or reading group

## Recommended Reading for Perspective Change

- **The Bible** - Start here, always
- **Classic Christian literature** - C.S. Lewis, G.K. Chesterton, etc.
- **Biographies of Christian leaders** - Learn from their experiences
- **Books on Christian living** - Practical guidance for daily life
- **Theological works** - Deepen your understanding of doctrine

Reading is a gift that keeps on giving. Each book you read adds another layer to your understanding of the world and your relationship with God. Start today, and watch how reading transforms your perspective.`,
      featuredImage: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "REFLECTION",
      tags: ["reading", "spiritual-growth", "perspective", "christian-living"],
      status: "PUBLISHED",
      publishedAt: new Date('2024-01-01'),
      readTime: 9,
      views: 1547,
      likes: 37,
      isFeatured: true,
      seoTitle: "How Reading Changes Your Perspective - Christian Reading Guide",
      seoDescription: "Discover how reading Christian literature and the Bible can transform your worldview and deepen your faith."
    },
    {
      title: "The Art of Writing - Expressing Faith Through Words",
      slug: "the-art-of-writing",
      excerpt: "Exploring how writing can be a form of worship, a tool for ministry, and a way to share God's love with others through the written word.",
      content: `# The Art of Writing - Expressing Faith Through Words

Writing is a powerful form of expression that allows us to share our faith, document our spiritual journey, and minister to others through the written word. For Christians, writing becomes more than just a skill—it becomes a form of worship and ministry.

## Writing as Worship

When we write about our faith, we're engaging in an act of worship. We're:

- **Glorifying God** - Sharing His goodness and faithfulness
- **Reflecting on His works** - Documenting how He's moved in our lives
- **Expressing gratitude** - Thanking Him for His blessings
- **Declaring His truth** - Proclaiming biblical principles

## The Ministry of Writing

Writing can be a powerful tool for ministry:

### 1. Sharing Testimonies
Our personal stories of God's work in our lives can encourage and inspire others.

### 2. Teaching Biblical Truth
Writing allows us to explain complex theological concepts in accessible ways.

### 3. Encouraging Others
Through our words, we can provide comfort, hope, and encouragement to fellow believers.

### 4. Reaching the Lost
Writing can be a way to share the gospel with those who might not otherwise hear it.

## Biblical Examples of Writing

The Bible itself is a collection of written works that demonstrate the power of writing:

- **The Psalms** - Poetry that expresses every human emotion
- **The Proverbs** - Wisdom literature that guides daily living
- **The Epistles** - Letters that teach, encourage, and correct
- **The Gospels** - Biographical accounts that reveal Jesus Christ

## Developing Your Writing Skills

To become a better writer:

1. **Read widely** - Learn from other writers
2. **Write regularly** - Practice makes perfect
3. **Study the craft** - Learn about grammar, style, and structure
4. **Seek feedback** - Get input from others
5. **Pray for guidance** - Ask God to guide your words

## Writing for God's Glory

Remember that when we write for God's glory:

- **Our words have power** - They can change lives
- **Our stories matter** - They can inspire others
- **Our testimony is valuable** - It can lead others to Christ
- **Our writing is worship** - It honors God

Whether you're writing a blog post, a letter to a friend, or a journal entry, remember that your words can be used by God to touch hearts and change lives. Write with purpose, write with passion, and write for His glory.`,
      featuredImage: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "REFLECTION",
      tags: ["writing", "ministry", "worship", "christian-living"],
      status: "PUBLISHED",
      publishedAt: new Date('2023-12-28'),
      readTime: 8,
      views: 632,
      likes: 28,
      isFeatured: false,
      seoTitle: "The Art of Writing - Expressing Faith Through Words",
      seoDescription: "Learn how writing can be a form of worship and ministry, sharing God's love through the written word."
    }
  ];

  // Create blog posts
  for (const postData of blogPosts) {
    const post = await prisma.blogPost.upsert({
      where: { slug: postData.slug },
      update: {},
      create: {
        ...postData,
        authorId: adminUser.id
      }
    });
    console.log('✅ Blog post created:', post.title);
  }

  // Create sample contact messages
  const contactMessages = [
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      subject: "Thank you for your ministry",
      message: "I just wanted to thank you for the wonderful blog posts. They have been such a blessing to me and have helped me grow in my faith. Keep up the great work!",
      status: "READ",
      isRead: true
    },
    {
      name: "Michael Chen",
      email: "michael.chen@email.com",
      subject: "Question about Bible study",
      message: "I've been reading your posts about Bible study and I have a question about how to get started with a daily reading plan. Could you recommend a good approach for beginners?",
      status: "NEW",
      isRead: false
    },
    {
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      subject: "Prayer request",
      message: "Please pray for my family as we go through a difficult time. Your posts about God's faithfulness have been a source of comfort.",
      status: "REPLIED",
      isRead: true,
      repliedAt: new Date(),
      replyMessage: "Thank you for reaching out. We are praying for you and your family during this difficult time. God is faithful and He will see you through."
    }
  ];

  for (const contactData of contactMessages) {
    const contact = await prisma.contact.create({
      data: contactData
    });
    console.log('✅ Contact message created:', contact.name);
  }

  // Create sample donations
  const donations = [
    {
      donorName: "John Smith",
      email: "john.smith@email.com",
      amount: 50.00,
      currency: "USD",
      paymentMethod: "STRIPE",
      paymentId: "pi_1234567890",
      status: "COMPLETED",
      message: "Thank you for your ministry. God bless!",
      isAnonymous: false,
      receiptSent: true
    },
    {
      donorName: "Anonymous",
      email: "anonymous@email.com",
      amount: 25.00,
      currency: "USD",
      paymentMethod: "PAYPAL",
      paymentId: "pp_0987654321",
      status: "COMPLETED",
      message: "Keep sharing God's word!",
      isAnonymous: true,
      receiptSent: false
    },
    {
      donorName: "Mary Williams",
      email: "mary.williams@email.com",
      amount: 100.00,
      currency: "USD",
      paymentMethod: "STRIPE",
      paymentId: "pi_1122334455",
      status: "COMPLETED",
      message: "Your blog has been such a blessing to our family. Thank you for your faithful service.",
      isAnonymous: false,
      receiptSent: true
    }
  ];

  for (const donationData of donations) {
    const donation = await prisma.donation.create({
      data: donationData
    });
    console.log('✅ Donation created:', donation.donorName);
  }

  // Create sample Bible verses
  const bibleVerses = [
    {
      title: "God's Love",
      book: "John",
      chapter: 3,
      verse: 16,
      text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
      translation: "NIV",
      isActive: true,
      isFeatured: true,
      displayDate: new Date('2024-01-01')
    },
    {
      title: "Trust in the Lord",
      book: "Proverbs",
      chapter: 3,
      verse: 5,
      text: "Trust in the Lord with all your heart and lean not on your own understanding.",
      translation: "NIV",
      isActive: true,
      isFeatured: true,
      displayDate: new Date('2024-01-02')
    },
    {
      title: "Strength in Weakness",
      book: "2 Corinthians",
      chapter: 12,
      verse: 9,
      text: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.' Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me.",
      translation: "NIV",
      isActive: true,
      isFeatured: false,
      displayDate: new Date('2024-01-03')
    },
    {
      title: "Peace of God",
      book: "Philippians",
      chapter: 4,
      verse: 7,
      text: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
      translation: "NIV",
      isActive: true,
      isFeatured: true,
      displayDate: new Date('2024-01-04')
    },
    {
      title: "Faith and Works",
      book: "James",
      chapter: 2,
      verse: 17,
      text: "In the same way, faith by itself, if it is not accompanied by action, is dead.",
      translation: "NIV",
      isActive: true,
      isFeatured: false,
      displayDate: new Date('2024-01-05')
    },
    {
      title: "God's Plans",
      book: "Jeremiah",
      chapter: 29,
      verse: 11,
      text: "For I know the plans I have for you,' declares the Lord, 'plans to prosper you and not to harm you, to give you hope and a future.",
      translation: "NIV",
      isActive: true,
      isFeatured: true,
      displayDate: new Date('2024-01-06')
    },
    {
      title: "Love One Another",
      book: "1 John",
      chapter: 4,
      verse: 19,
      text: "We love because he first loved us.",
      translation: "NIV",
      isActive: true,
      isFeatured: false,
      displayDate: new Date('2024-01-07')
    },
    {
      title: "The Good Shepherd",
      book: "John",
      chapter: 10,
      verse: 11,
      text: "I am the good shepherd. The good shepherd lays down his life for the sheep.",
      translation: "NIV",
      isActive: true,
      isFeatured: true,
      displayDate: new Date('2024-01-08')
    },
    {
      title: "Seek First",
      book: "Matthew",
      chapter: 6,
      verse: 33,
      text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.",
      translation: "NIV",
      isActive: true,
      isFeatured: false,
      displayDate: new Date('2024-01-09')
    },
    {
      title: "God's Word",
      book: "Hebrews",
      chapter: 4,
      verse: 12,
      text: "For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart.",
      translation: "NIV",
      isActive: true,
      isFeatured: true,
      displayDate: new Date('2024-01-10')
    }
  ];

  for (const verseData of bibleVerses) {
    const verse = await prisma.bibleVerse.create({
      data: verseData
    });
    console.log('✅ Bible verse created:', `${verse.book} ${verse.chapter}:${verse.verse}`);
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log(`
📊 Summary:
- 1 Admin user created
- ${blogPosts.length} Blog posts created
- ${contactMessages.length} Contact messages created
- ${donations.length} Donations created
- ${bibleVerses.length} Bible verses created

🔑 Admin Login:
- Email: admin@biblelover.com
- Password: admin123

🌐 Your API is ready at: http://localhost:5000/api
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });






