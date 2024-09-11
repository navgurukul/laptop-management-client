(async () => {
    const wallpaper = await import('wallpaper');

    if (wallpaper.setWallpaper) {
        await wallpaper.setWallpaper('pic.jpeg');
        // await wallpaper.setWallpaper('pic.jpeg');
        console.log('Wallpaper changed!');
    } else {
        console.error('Failed to set the wallpaper.');
    }
})();
