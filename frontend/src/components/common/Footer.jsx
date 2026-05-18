import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍔</span>
              <span className="font-display font-bold text-xl text-white">FoodRush</span>
            </div>
            <p className="text-sm leading-relaxed">
              Delivering happiness to your doorstep. Fresh food from the best local restaurants.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-white transition-colors"><FiInstagram size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><FiTwitter size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><FiFacebook size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
              
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">For Partners</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Add Restaurant</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Deliver with Us</Link></li>
             
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Safety</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
          <p>© 2026 Azhagu. All rights reserved.</p>
          <p>Made with ❤️ for food lovers</p>
        </div>
      </div>
    </footer>
  );
}
