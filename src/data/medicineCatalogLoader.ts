import type { Medicine } from '../types';

export async function loadAlgerianMedicineCatalog(): Promise<Medicine[]> {
  const categories = await Promise.all([
    import('./algeriaMedicineCatalog/01.json'),
    import('./algeriaMedicineCatalog/02.json'),
    import('./algeriaMedicineCatalog/03.json'),
    import('./algeriaMedicineCatalog/04.json'),
    import('./algeriaMedicineCatalog/06.json'),
    import('./algeriaMedicineCatalog/07.json'),
    import('./algeriaMedicineCatalog/08.json'),
    import('./algeriaMedicineCatalog/09.json'),
    import('./algeriaMedicineCatalog/10.json'),
    import('./algeriaMedicineCatalog/11.json'),
    import('./algeriaMedicineCatalog/12.json'),
    import('./algeriaMedicineCatalog/13.json'),
    import('./algeriaMedicineCatalog/14.json'),
    import('./algeriaMedicineCatalog/15.json'),
    import('./algeriaMedicineCatalog/16.json'),
    import('./algeriaMedicineCatalog/18.json'),
    import('./algeriaMedicineCatalog/19.json'),
    import('./algeriaMedicineCatalog/20.json'),
    import('./algeriaMedicineCatalog/21.json'),
    import('./algeriaMedicineCatalog/22.json'),
    import('./algeriaMedicineCatalog/24.json'),
    import('./algeriaMedicineCatalog/25.json'),
    import('./algeriaMedicineCatalog/26.json'),
    import('./algeriaMedicineCatalog/27.json'),
  ]);
  return categories.flatMap(({ default: medicines }) => medicines as Medicine[]);
}
