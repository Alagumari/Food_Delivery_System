"""
Management command: python manage.py create_sample_data

Creates demo users, restaurants, menu items, and sample orders
so the platform works out of the box for development/demo.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.restaurants.models import Restaurant, RestaurantCategory
from apps.menu.models import MenuCategory, MenuItem
from apps.orders.models import Order, OrderItem
from decimal import Decimal
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates sample data for development and demo'

    def handle(self, *args, **kwargs):
        self.stdout.write('🍔 Creating FoodRush sample data...\n')

        # =====================
        # CREATE USERS
        # =====================
        admin = self._create_user('admin', 'admin@foodrush.com', 'admin123', 'Admin', 'User', 'admin', superuser=True)
        customer = self._create_user('john_doe', 'customer@test.com', 'test123', 'John', 'Doe', 'customer')
        customer2 = self._create_user('jane_doe', 'jane@test.com', 'test123', 'Jane', 'Doe', 'customer')
        owner1 = self._create_user('pizza_owner', 'owner@pizza.com', 'test123', 'Marco', 'Rossi', 'restaurant_owner')
        owner2 = self._create_user('burger_owner', 'owner@burger.com', 'test123', 'Bob', 'Smith', 'restaurant_owner')
        owner3 = self._create_user('indian_owner', 'owner@spice.com', 'test123', 'Raj', 'Sharma', 'restaurant_owner')
        driver1 = self._create_user('driver1', 'driver@test.com', 'test123', 'Ravi', 'Kumar', 'delivery_partner')
        driver2 = self._create_user('driver2', 'driver2@test.com', 'test123', 'Amit', 'Singh', 'delivery_partner')

        # =====================
        # CREATE CATEGORIES
        # =====================
        categories_data = [
            ('Pizza', '🍕'), ('Burgers', '🍔'), ('Indian', '🍛'),
            ('Chinese', '🍜'), ('Sushi', '🍣'), ('Pasta', '🍝'),
            ('Desserts', '🍰'), ('Healthy', '🥗'), ('Mexican', '🌮'), ('Beverages', '☕'),
        ]
        categories = {}
        for name, icon in categories_data:
            cat, _ = RestaurantCategory.objects.get_or_create(name=name, defaults={'icon': icon, 'is_active': True})
            categories[name] = cat
        self.stdout.write('  ✅ Categories created')

        # =====================
        # CREATE RESTAURANTS
        # =====================
        r1 = self._create_restaurant(
            owner=owner1, name="Marco's Pizzeria", city="Mumbai",
            address="12 Baker Street, Andheri West", pincode="400053",
            phone="9800000001", description="Authentic Neapolitan pizzas baked in wood-fired ovens",
            delivery_time=35, delivery_fee=Decimal('29'), min_order=Decimal('299'),
            rating=Decimal('4.5'), total_reviews=312, total_orders=2150,
            cuisine_list=[categories['Pizza'], categories['Pasta']],
        )
        r2 = self._create_restaurant(
            owner=owner2, name="Burger Palace", city="Mumbai",
            address="88 MG Road, Bandra", pincode="400050",
            phone="9800000002", description="Juicy gourmet burgers with crispy fries",
            delivery_time=25, delivery_fee=Decimal('0'), min_order=Decimal('199'),
            rating=Decimal('4.2'), total_reviews=198, total_orders=1870,
            cuisine_list=[categories['Burgers']],
        )
        r3 = self._create_restaurant(
            owner=owner3, name="Spice Garden", city="Mumbai",
            address="55 Linking Road, Khar", pincode="400052",
            phone="9800000003", description="Royal Indian curries and tandoor specialties",
            delivery_time=40, delivery_fee=Decimal('19'), min_order=Decimal('399'),
            rating=Decimal('4.7'), total_reviews=524, total_orders=3100,
            cuisine_list=[categories['Indian']],
        )
        self.stdout.write('  ✅ Restaurants created')

        # =====================
        # CREATE MENUS
        # =====================
        # Marco's Pizzeria
        starters_cat = MenuCategory.objects.create(restaurant=r1, name='Starters', sort_order=1)
        pizzas_cat   = MenuCategory.objects.create(restaurant=r1, name='Pizzas', sort_order=2)
        drinks_cat   = MenuCategory.objects.create(restaurant=r1, name='Drinks', sort_order=3)

        MenuItem.objects.bulk_create([
            MenuItem(restaurant=r1, category=starters_cat, name='Garlic Bread', description='Toasted with herbs & butter', price=Decimal('99'), food_type='veg', is_available=True, calories=210),
            MenuItem(restaurant=r1, category=starters_cat, name='Bruschetta', description='Tomatoes, basil, olive oil on grilled bread', price=Decimal('129'), food_type='veg', is_available=True, calories=180),
            MenuItem(restaurant=r1, category=pizzas_cat, name='Margherita', description='Classic tomato sauce, mozzarella, fresh basil', price=Decimal('299'), food_type='veg', is_bestseller=True, is_available=True, calories=720),
            MenuItem(restaurant=r1, category=pizzas_cat, name='Pepperoni', description='Loaded with premium pepperoni & mozzarella', price=Decimal('399'), food_type='non_veg', is_bestseller=True, is_available=True, calories=880),
            MenuItem(restaurant=r1, category=pizzas_cat, name='BBQ Chicken', description='Grilled chicken, BBQ sauce, onions, mozzarella', price=Decimal('449'), food_type='non_veg', is_available=True, calories=920),
            MenuItem(restaurant=r1, category=pizzas_cat, name='Veggie Supreme', description='Bell peppers, mushrooms, olives, onions', price=Decimal('349'), food_type='veg', is_available=True, calories=680),
            MenuItem(restaurant=r1, category=drinks_cat, name='Lemonade', description='Fresh squeezed with mint', price=Decimal('79'), food_type='veg', is_available=True, calories=95),
            MenuItem(restaurant=r1, category=drinks_cat, name='Coke', description='Chilled', price=Decimal('49'), food_type='veg', is_available=True, calories=140),
        ])

        # Burger Palace
        burgers_cat = MenuCategory.objects.create(restaurant=r2, name='Burgers', sort_order=1)
        sides_cat   = MenuCategory.objects.create(restaurant=r2, name='Sides', sort_order=2)

        MenuItem.objects.bulk_create([
            MenuItem(restaurant=r2, category=burgers_cat, name='Classic Beef Burger', description='100% pure beef patty, lettuce, tomato, pickles', price=Decimal('199'), food_type='non_veg', is_bestseller=True, is_available=True, calories=650),
            MenuItem(restaurant=r2, category=burgers_cat, name='Crispy Chicken', description='Crispy fried chicken fillet with coleslaw', price=Decimal('179'), food_type='non_veg', is_bestseller=True, is_available=True, calories=580),
            MenuItem(restaurant=r2, category=burgers_cat, name='Veg Supreme', description='Mushroom & veggie patty with special sauce', price=Decimal('159'), food_type='veg', is_available=True, calories=480),
            MenuItem(restaurant=r2, category=burgers_cat, name='Double Smash', description='Double smash patties, caramelized onions, cheese', price=Decimal('299'), food_type='non_veg', is_available=True, calories=980),
            MenuItem(restaurant=r2, category=sides_cat, name='Loaded Fries', description='Crispy fries with cheese, jalapeños, sauce', price=Decimal('129'), food_type='veg', is_available=True, calories=450),
            MenuItem(restaurant=r2, category=sides_cat, name='Onion Rings', description='Beer-battered crispy rings', price=Decimal('99'), food_type='veg', is_available=True, calories=380),
        ])

        # Spice Garden
        snacks_cat = MenuCategory.objects.create(restaurant=r3, name='Starters', sort_order=1)
        mains_cat  = MenuCategory.objects.create(restaurant=r3, name='Main Course', sort_order=2)
        breads_cat = MenuCategory.objects.create(restaurant=r3, name='Breads & Rice', sort_order=3)

        MenuItem.objects.bulk_create([
            MenuItem(restaurant=r3, category=snacks_cat, name='Samosa (2 pcs)', description='Crispy pastry with spiced potato filling', price=Decimal('49'), food_type='veg', is_available=True, calories=280),
            MenuItem(restaurant=r3, category=snacks_cat, name='Paneer Tikka', description='Grilled cottage cheese with spices, served with chutney', price=Decimal('249'), food_type='veg', is_bestseller=True, is_available=True, calories=420),
            MenuItem(restaurant=r3, category=snacks_cat, name='Chicken Tikka', description='Tender chicken marinated in spices, chargrilled', price=Decimal('299'), food_type='non_veg', is_bestseller=True, is_available=True, calories=380),
            MenuItem(restaurant=r3, category=mains_cat, name='Butter Chicken', description='Tender chicken in rich tomato-cream sauce', price=Decimal('349'), food_type='non_veg', is_bestseller=True, is_available=True, calories=520),
            MenuItem(restaurant=r3, category=mains_cat, name='Paneer Butter Masala', description='Cottage cheese cubes in velvety tomato gravy', price=Decimal('299'), food_type='veg', is_available=True, calories=480),
            MenuItem(restaurant=r3, category=mains_cat, name='Dal Makhani', description='Black lentils slow-cooked overnight with butter', price=Decimal('249'), food_type='veg', is_available=True, calories=390),
            MenuItem(restaurant=r3, category=mains_cat, name='Lamb Rogan Josh', description='Kashmiri lamb curry with aromatic spices', price=Decimal('399'), food_type='non_veg', is_available=True, calories=550),
            MenuItem(restaurant=r3, category=breads_cat, name='Butter Naan', description='Soft leavened bread brushed with butter', price=Decimal('49'), food_type='veg', is_available=True, calories=180),
            MenuItem(restaurant=r3, category=breads_cat, name='Biryani (Chicken)', description='Fragrant basmati rice with tender chicken', price=Decimal('349'), food_type='non_veg', is_bestseller=True, is_available=True, calories=780),
        ])
        self.stdout.write('  ✅ Menu items created')

        # =====================
        # SAMPLE ORDERS
        # =====================
        pizza_items = list(MenuItem.objects.filter(restaurant=r1))
        o1 = Order.objects.create(
            customer=customer, restaurant=r1,
            delivery_address='42 Marine Drive', delivery_city='Mumbai', delivery_pincode='400001',
            subtotal=Decimal('698'), delivery_fee=Decimal('29'), tax=Decimal('34.90'),
            total=Decimal('761.90'), payment_method='upi', payment_status='completed',
            status='delivered', delivery_partner=driver1,
            order_number='FRDEM0001',
        )
        if pizza_items:
            OrderItem.objects.create(
                order=o1, menu_item=pizza_items[0],
                menu_item_name=pizza_items[0].name, quantity=2,
                unit_price=pizza_items[0].price,
                total_price=pizza_items[0].price * 2,
            )

        o2 = Order.objects.create(
            customer=customer, restaurant=r3,
            delivery_address='10 Hill Road, Bandra', delivery_city='Mumbai', delivery_pincode='400050',
            subtotal=Decimal('648'), delivery_fee=Decimal('19'), tax=Decimal('32.40'),
            total=Decimal('699.40'), payment_method='cod',
            status='pending', order_number='FRDEM0002',
        )
        self.stdout.write('  ✅ Sample orders created')

        self.stdout.write(self.style.SUCCESS('\n🎉 Sample data created successfully!\n'))
        self.stdout.write('Demo accounts:')
        self.stdout.write('  👤 Customer  : customer@test.com / test123')
        self.stdout.write('  🍕 Restaurant: owner@pizza.com  / test123')
        self.stdout.write('  🚴 Delivery  : driver@test.com  / test123')
        self.stdout.write('  🛡️ Admin     : admin@foodrush.com / admin123\n')

    def _create_user(self, username, email, password, first, last, role, superuser=False):
        if User.objects.filter(email=email).exists():
            return User.objects.get(email=email)
        if superuser:
            u = User.objects.create_superuser(
                username=username, email=email, password=password,
                first_name=first, last_name=last,
            )
            u.role = 'admin'
            u.save()
        else:
            u = User.objects.create_user(
                username=username, email=email, password=password,
                first_name=first, last_name=last, role=role,
            )
        return u

    def _create_restaurant(self, owner, name, city, address, pincode, phone,
                            description, delivery_time, delivery_fee, min_order,
                            rating, total_reviews, total_orders, cuisine_list):
        if Restaurant.objects.filter(owner=owner).exists():
            return Restaurant.objects.get(owner=owner)
        r = Restaurant.objects.create(
            owner=owner, name=name, city=city, state='Maharashtra',
            address=address, pincode=pincode, phone=phone,
            description=description, delivery_time=delivery_time,
            delivery_fee=delivery_fee, min_order=min_order,
            rating=rating, total_reviews=total_reviews, total_orders=total_orders,
            status='approved', is_open=True, is_featured=True, price_range='$$',
        )
        r.cuisine_types.set(cuisine_list)
        return r
