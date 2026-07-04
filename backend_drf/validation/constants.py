"""Shared constants for the validation engine — the canonical category, colour
and brand→category lists. Kept in one place so every validator agrees."""

CATEGORIES = [
    'Phone & Tablets', 'Wallet & Purse', 'Keys', 'Watch', 'Bag & Backpack',
    'Laptop & Computer', 'Earphones & Headphones', 'ID Card & Documents',
    'Jewellery', 'Clothing', 'Water Bottle', 'Spectacles', 'Camera',
    'Books & Stationery', 'Pet', 'Other',
]

# NOTE: kept in sync with the frontend's existing palette (uses "Grey" + "Other")
# so we don't invalidate items already stored in the database.
COLORS = [
    'Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Yellow',
    'Orange', 'Brown', 'Pink', 'Purple', 'Gold', 'Multicolor', 'Other',
]

# Brand -> the categories that brand is normally associated with. Used only to
# WARN (never hard-reject) because the list is deliberately non-exhaustive.
BRAND_CATEGORY_MAP = {
    'apple':              ['Phone & Tablets', 'Laptop & Computer', 'Watch', 'Earphones & Headphones'],
    'samsung':            ['Phone & Tablets', 'Laptop & Computer', 'Watch'],
    'oneplus':            ['Phone & Tablets', 'Earphones & Headphones'],
    'xiaomi':             ['Phone & Tablets', 'Laptop & Computer'],
    'nike':               ['Clothing', 'Bag & Backpack'],
    'adidas':             ['Clothing', 'Bag & Backpack'],
    'puma':               ['Clothing', 'Bag & Backpack'],
    'casio':              ['Watch'],
    'titan':              ['Watch'],
    'fossil':             ['Watch'],
    'wildcraft':          ['Bag & Backpack'],
    'skybags':            ['Bag & Backpack'],
    'american tourister': ['Bag & Backpack'],
    'dell':               ['Laptop & Computer'],
    'hp':                 ['Laptop & Computer'],
    'lenovo':             ['Laptop & Computer'],
    'asus':               ['Laptop & Computer'],
    'sony':               ['Earphones & Headphones', 'Camera'],
    'jbl':                ['Earphones & Headphones'],
    'boat':               ['Earphones & Headphones'],
    'bose':               ['Earphones & Headphones'],
    'ray-ban':            ['Spectacles'],
    'fastrack':           ['Spectacles', 'Watch'],
}

# Which unique-identifier fields make sense for which categories (frontend uses
# the same map to show/hide the inputs).
UNIQUE_ID_CATEGORIES = {
    'serial_number': ['Laptop & Computer', 'Camera'],
    'imei_number':   ['Phone & Tablets'],
    'model_number':  ['Laptop & Computer', 'Phone & Tablets', 'Camera', 'Watch'],
    'reg_number':    ['Pet'],
}
