export async function getAllPosts() {
  return import.meta.glob('../**/blog/*.md', {
    eager: true,
  });
}
