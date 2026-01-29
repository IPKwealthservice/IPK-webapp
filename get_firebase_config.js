const { exec } = require('child_process');

exec('firebase apps:sdkconfig web --project ipkwealth-e53a7', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log('STDOUT:', stdout);
    console.error('STDERR:', stderr);
});
