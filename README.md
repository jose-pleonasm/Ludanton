# Ludanton

```html
<video id="player" controls>
	<source src="https://vjs.zencdn.net/v/oceans.mp4?SD" type="video/mp4" data-quality="360p">
	<source src="https://vjs.zencdn.net/v/oceans.mp4?HD" type="video/mp4" data-quality="720p">
	<source src="https://vjs.zencdn.net/v/oceans.mp4?4K" type="video/mp4" data-quality="4K">
</video>
<script>
	const player = new Ludanton.Player(document.querySelector('#player'));
</script>
```