module.exports = {
  apps: [{
    name: 'private-api',
    script: './InstagramAPIScript/index.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-35-167-165-4.us-west-2.compute.amazonaws.com',
      ref: 'origin/master',
      repo: 'git@github.com:Baghdad/InstagramScript.git',
      path: '/home/ubuntu/PrivateAPI',
      'post-deploy': 'npm --prefix ./InstagramAPIScript install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}