   const ghpages = require('gh-pages');
   
   // The URL in your iframe needs to be updated later based on your GitHub Pages URL
   console.log('Deploying to GitHub Pages...');
   
   ghpages.publish('build', {
     branch: 'gh-pages',
     repo: 'https://github.com/YOUR-USERNAME/qualiabot.git'
   }, function(err) {
     if (err) {
       console.error('Deployment error:', err);
     } else {
       console.log('Deployment complete!');
       console.log('Your widget is now available at: https://YOUR-USERNAME.github.io/qualiabot/');
     }
   });
