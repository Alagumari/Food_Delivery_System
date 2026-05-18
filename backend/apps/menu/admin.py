from django.contrib import admin
from .models import MenuCategory, MenuItem, MenuItemVariant, MenuItemAddon


class MenuItemVariantInline(admin.TabularInline):
    model = MenuItemVariant
    extra = 1


class MenuItemAddonInline(admin.TabularInline):
    model = MenuItemAddon
    extra = 1


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'name', 'sort_order', 'is_active')
    list_filter = ('is_active',)


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'category', 'price', 'food_type', 'is_available', 'is_bestseller')
    list_filter = ('food_type', 'is_available', 'is_bestseller')
    search_fields = ('name', 'restaurant__name')
    list_editable = ('is_available', 'is_bestseller')
    inlines = [MenuItemVariantInline, MenuItemAddonInline]
