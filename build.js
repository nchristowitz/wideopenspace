const fs = require('fs');

// Make sure articles folder exists
if (!fs.existsSync('articles')) {
  fs.mkdirSync('articles');
}

// Article definitions
const articles = [
  {
    id: 'arena-gallery-component',
    filename: 'just-me-and-the-lads.html',
    title: 'Just me and the lads and $1 bajillion in funding',
    description: 'I connected a channel I started as a repository for press photos pulled from TechCrunch.',
    hasJs: true // This article needs the arena-slideshow.js
  },
  {
    id: 'article-on-being-a-better-consumer', 
    filename: 'on-being-a-conscious-consumer.html',
    title: 'On Being A Conscious Consumer',
    description: 'Lately I\'ve been trying to wriggle free of the tendrils of US hegemony.',
    hasJs: false
  },
  {
    id: 'article-on-running',
    filename: 'on-running.html', 
    title: 'On Running',
    description: 'I think I\'ve been running for almost 13 years now.',
    hasJs: false
  }
];

// Extract article content from index.html
const indexContent = fs.readFileSync('index.html', 'utf8');

// Load templates
const mainTemplate = fs.readFileSync('template.html', 'utf8');
const articleTemplate = fs.readFileSync('article-template.html', 'utf8');

// Process each article
articles.forEach(article => {
  // Extract the article content
  const startMarker = `<div id="${article.id}">`;
  const startIndex = indexContent.indexOf(startMarker);
  
  let endIndex = -1;
  if (article.id === 'arena-gallery-component') {
    // For the gallery, find the closing div of the entire component
    endIndex = indexContent.indexOf('</div>', indexContent.indexOf('Copy link to share', startIndex)) + 6;
  } else {
    // For others, find the next hr divider
    endIndex = indexContent.indexOf('<hr class="divider">', startIndex);
  }
  
  const articleContent = indexContent.substring(startIndex, endIndex);
  
  // Save the raw article content to a file IN THE ARTICLES FOLDER
  fs.writeFileSync(`articles/${article.id}.html`, articleContent);
  console.log(`Created articles/${article.id}.html`);
  
  // Create standalone article file IN THE ROOT DIRECTORY
  let standaloneContent = articleTemplate;
  standaloneContent = standaloneContent.replace('{{ARTICLE_TITLE}}', article.title);
  standaloneContent = standaloneContent.replace('{{ARTICLE_DESCRIPTION}}', article.description);
  standaloneContent = standaloneContent.replace('{{ARTICLE_CONTENT}}', articleContent);
  
  // Add JavaScript if needed (only for arena gallery)
  if (article.hasJs) {
    standaloneContent = standaloneContent.replace('{{ARTICLE_JS}}', '<script src="arena-slideshow.js"></script>');
  } else {
    standaloneContent = standaloneContent.replace('{{ARTICLE_JS}}', '');
  }
  
  // Write standalone article file TO ROOT DIRECTORY
  fs.writeFileSync(`./${article.filename}`, standaloneContent);
  console.log(`Created ${article.filename} in root directory`);
});

// Create new index.html by combining main template with article files
let combinedContent = mainTemplate;

// Get all content between the header and footer
let contentParts = [];

// Read article files and combine them
articles.forEach((article, index) => {
  const articleContent = fs.readFileSync(`articles/${article.id}.html`, 'utf8');
  contentParts.push(articleContent);
  
  // Add divider between articles (but not after the last one)
  if (index < articles.length - 1) {
    contentParts.push('\n<hr class="divider">\n');
  }
});

// Get the remaining content from the original index.html
// (everything after the last article)
const lastArticleId = articles[articles.length - 1].id;
const lastArticleIndex = indexContent.indexOf(`<div id="${lastArticleId}">`);
let lastArticleEndIndex;

if (lastArticleId === 'article-on-running') {
  lastArticleEndIndex = indexContent.indexOf('<hr class="divider">', lastArticleIndex);
} else {
  lastArticleEndIndex = indexContent.indexOf('</div>', indexContent.indexOf('Copy link to share', lastArticleIndex)) + 6;
}

const remainingContent = indexContent.substring(lastArticleEndIndex);
contentParts.push(remainingContent);

// Combine all parts
const fullContent = contentParts.join('');

// Replace placeholder in main template
const finalContent = combinedContent.replace('{{CONTENT}}', fullContent);

// Write new index.html
fs.writeFileSync('index-new.html', finalContent);
console.log('Created index-new.html');

// Update RSS feed
const feedContent = fs.readFileSync('feed.xml', 'utf8');
let newFeedContent = feedContent;

articles.forEach(article => {
  // Find the article link in the feed
  let linkToReplace = '';
  if (article.id === 'arena-gallery-component') {
    linkToReplace = 'https://wideopen.space/#arena-gallery-component';
  } else if (article.id === 'article-on-being-a-better-consumer') {
    linkToReplace = 'https://wideopen.space/#article-on-being-a-better-consumer';
  } else if (article.id === 'article-on-running') {
    linkToReplace = 'https://wideopen.space/#article-on-running';
  }
  
  const newLink = `https://wideopen.space/${article.filename}`;
  newFeedContent = newFeedContent.replace(linkToReplace, newLink);
});

fs.writeFileSync('feed-new.xml', newFeedContent);
console.log('Created feed-new.xml');

console.log('\nDone! Next steps:');
console.log('1. Review the generated files');
console.log('2. Replace your current index.html with index-new.html');
console.log('3. Replace your current feed.xml with feed-new.xml');
console.log('4. Upload the new HTML files and modified files to your host');
console.log('\nThe articles are now stored in the articles/ folder for easy maintenance!');
console.log('The public article HTML files are in the root directory for proper links.');