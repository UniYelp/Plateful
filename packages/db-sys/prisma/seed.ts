async function seed() {
	// TODO: only run if local
}

seed()
	.then(() => console.log("seeding successful..."))
	.catch((err) => console.error("seeding error", err));
