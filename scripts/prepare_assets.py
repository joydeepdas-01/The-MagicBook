import os
import json
import glob
import shutil

books_src = r'The MagicBook V7\Books'
out_dir = r'magicbook-mobile\public\books'
os.makedirs(out_dir, exist_ok=True)

categories = [
    {'id': 'animals-1', 'title': 'Animals 1', 'icon': '🦁', 'dir': 'animals 1'},
    {'id': 'animals-2', 'title': 'Animals 2', 'icon': '🐘', 'dir': 'animals 2'},
    {'id': 'dinosaurs', 'title': 'Dinosaurs', 'icon': '🦖', 'dir': 'dinosaurs'},
    {'id': 'fantasy', 'title': 'Fantasy & Magic', 'icon': '🧚', 'dir': 'fantasy'},
    {'id': 'plants-1', 'title': 'Flowers & Plants 1', 'icon': '🌺', 'dir': 'plants 1'},
    {'id': 'plants-2', 'title': 'Flowers & Plants 2', 'icon': '🌻', 'dir': 'plants 2'},
    {'id': 'magicbook', 'title': 'The MagicBook Classic', 'icon': '✨', 'dir': 'The MagicBook'},
]

catalog = []
total_pages = 0

for cat in categories:
    cat_dir = os.path.join(books_src, cat['dir'])
    target_cat_dir = os.path.join(out_dir, cat['id'])
    os.makedirs(target_cat_dir, exist_ok=True)
    
    gifs = sorted(glob.glob(os.path.join(cat_dir, '*.gif')), key=lambda x: (
        int(''.join(filter(str.isdigit, os.path.basename(x)))) if any(c.isdigit() for c in os.path.basename(x)) else 0
    ))
    
    pages = []
    for g in gifs:
        fname = os.path.basename(g)
        target_path = os.path.join(target_cat_dir, fname)
        shutil.copyfile(g, target_path)
        
        pages.append({
            'filename': fname,
            'url': f'books/{cat["id"]}/{fname}',
            'name': f"{cat['title']} - Page {len(pages) + 1}"
        })
        total_pages += 1
    
    catalog.append({
        'id': cat['id'],
        'title': cat['title'],
        'icon': cat['icon'],
        'pagesCount': len(pages),
        'pages': pages
    })

meta_path = os.path.join(r'magicbook-mobile\public', 'books.json')
with open(meta_path, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, indent=2)

print(f'Catalog created with {len(catalog)} books and {total_pages} total pages.')

# Also copy sounds
sounds_src = r'The MagicBook V7\extracted_assets\sounds'
sounds_out = r'magicbook-mobile\public\sounds'
os.makedirs(sounds_out, exist_ok=True)

for wav in glob.glob(os.path.join(sounds_src, '*.wav')):
    shutil.copyfile(wav, os.path.join(sounds_out, os.path.basename(wav)))

print('All sounds copied.')

