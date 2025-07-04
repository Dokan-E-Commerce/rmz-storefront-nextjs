import { useLanguage } from '@/components/LanguageProvider';

// Translation data
const translations = {
  en: {
    // Navigation
    home: 'Home',
    products: 'Products',
    categories: 'Categories',
    about: 'About',
    contact: 'Contact',
    cart: 'Cart',
    wishlist: 'Wishlist',
    account: 'Account',
    orders: 'Orders',
    courses: 'Courses',
    subscriptions: 'Subscriptions',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    menu: 'Menu',
    search: 'Search',
    navigation: 'Navigation',
    tools: 'Tools',
    theme: 'Theme',
    view: 'View',

    // Common actions
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    view_all: 'View All',
    read_more: 'Read More',
    show_more: 'Show More',
    show_less: 'Show Less',

    // E-commerce specific
    add_to_cart: 'Add to Cart',
    add_to_wishlist: 'Add to Wishlist',
    remove_from_wishlist: 'Remove from Wishlist',
    buy_now: 'Buy Now',
    quick_purchase: 'Quick Purchase',
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax',
    discount: 'Discount',
    coupon: 'Coupon',
    apply_coupon: 'Apply Coupon',
    remove_coupon: 'Remove Coupon',
    checkout: 'Checkout',
    continue_shopping: 'Continue Shopping',
    empty_cart: 'Your cart is empty',
    empty_wishlist: 'Your wishlist is empty',
    in_stock: 'In Stock',
    out_of_stock: 'Out of Stock',
    free_shipping: 'Free Shipping',
    featured: 'Featured',
    sale: 'Sale',
    new: 'New',
    bestseller: 'Bestseller',

    // Product page
    product_details: 'Product Details',
    specifications: 'Specifications',
    reviews: 'Reviews',
    related_products: 'Related Products',
    product_images: 'Product Images',
    select_variant: 'Select Variant',
    variants: 'Variants',
    description: 'Description',
    short_description: 'Short Description',
    rating: 'Rating',
    write_review: 'Write a Review',
    no_reviews: 'No reviews yet',
    share: 'Share',

    // Cart page
    shopping_cart: 'Shopping Cart',
    update_cart: 'Update Cart',
    remove_item: 'Remove Item',
    cart_summary: 'Cart Summary',
    order_summary: 'Order Summary',
    proceed_to_checkout: 'Proceed to Checkout',
    clear_cart: 'Clear Cart',
    clear_all: 'Clear All',
    cart_total: 'Cart Total',

    // Account page
    my_account: 'My Account',
    profile: 'Profile',
    personal_info: 'Personal Information',
    change_password: 'Change Password',
    address_book: 'Address Book',
    order_history: 'Order History',
    download_history: 'Download History',
    reward_points: 'Reward Points',
    affiliate: 'Affiliate',
    newsletter: 'Newsletter',
    wishlist_items: 'Wishlist Items',

    // Orders page
    order_id: 'Order ID',
    order_date: 'Order Date',
    order_status: 'Order Status',
    order_total: 'Order Total',
    view_order: 'View Order',
    track_order: 'Track Order',
    reorder: 'Reorder',
    order_details: 'Order Details',
    billing_address: 'Billing Address',
    shipping_address: 'Shipping Address',
    payment_method: 'Payment Method',
    shipping_method: 'Shipping Method',
    no_orders: 'No orders found',

    // Auth
    email: 'Email',
    password: 'Password',
    confirm_password: 'Confirm Password',
    first_name: 'First Name',
    last_name: 'Last Name',
    phone: 'Phone',
    forgot_password: 'Forgot Password?',
    remember_me: 'Remember Me',
    create_account: 'Create Account',
    already_have_account: 'Already have an account?',
    dont_have_account: "Don't have an account?",
    login_required: 'Login Required',
    registration_successful: 'Registration Successful',
    login_successful: 'Login Successful',
    logout_successful: 'Logout Successful',

    // Notifications
    item_added_to_cart: 'Item added to cart',
    item_removed_from_cart: 'Item removed from cart',
    item_added_to_wishlist: 'Item added to wishlist',
    item_removed_from_wishlist: 'Item removed from wishlist',
    order_placed_successfully: 'Order placed successfully',
    profile_updated: 'Profile updated successfully',
    password_changed: 'Password changed successfully',
    coupon_applied: 'Coupon applied successfully',
    coupon_removed: 'Coupon removed',
    invalid_coupon: 'Invalid coupon code',

    // Reviews
    customer_reviews: 'Customer Reviews',
    write_a_review: 'Write a Review',
    review_title: 'Review Title',
    your_review: 'Your Review',
    submit_review: 'Submit Review',
    submitReview: 'Submit Review',
    helpful: 'Helpful',
    not_helpful: 'Not Helpful',
    verified_purchase: 'Verified Purchase',
    stars: 'Stars',
    selectRating: 'Select a rating',
    pleaseSelectRating: 'Please select a rating',
    pleaseWriteComment: 'Please write a comment',
    reviewSubmitted: 'Review submitted successfully',
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    veryGood: 'Very Good',
    excellent: 'Excellent',
    writeReview: 'Write a Review',

    // Language switcher
    language: 'Language',
    english: 'English',
    arabic: 'العربية',

    // Theme switcher
    toggleTheme: 'Toggle theme',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    systemTheme: 'System',

    // Footer
    footer_about: 'About Us',
    footer_contact: 'Contact Us',
    footer_privacy: 'Privacy Policy',
    footer_terms: 'Terms of Service',
    footer_help: 'Help Center',
    footer_shipping: 'Shipping Info',
    footer_returns: 'Returns',
    footer_newsletter: 'Newsletter',
    footer_social: 'Follow Us',

    // Categories and featured products
    shop_by_category: 'Shop by Category',
    featured_products: 'Featured Products',
    latest_products: 'Latest Products',
    popular_products: 'Popular Products',
    recommended_products: 'Recommended Products',
    view_all_categories: 'View All Categories',
    view_all_products: 'View All Products',
    category_products: 'Category Products',
    no_products_found: 'No products found',
    products_found: 'Products Found',

    // Quick purchase and enhanced features
    quick_view: 'Quick View',
    compare: 'Compare',
    compare_products: 'Compare Products',
    size_guide: 'Size Guide',
    ask_question: 'Ask a Question',
    notify_when_available: 'Notify When Available',
    bulk_order: 'Bulk Order',
    wholesale: 'Wholesale',

    // Review functionality
    review_helpful_question: 'Was this review helpful?',
    yes: 'Yes',
    no: 'No',
    report_review: 'Report Review',
    sort_reviews: 'Sort Reviews',
    most_recent: 'Most Recent',
    most_helpful: 'Most Helpful',
    highest_rating: 'Highest Rating',
    lowest_rating: 'Lowest Rating',

    // Additional order detail translations
    order_information: 'Order Information',
    customer_information: 'Customer Information',
    payment_information: 'Payment Information',
    order_comment: 'Order Comment',

    // Additional missing keys
    filter: 'Filter',
    sort: 'Sort',
    clear_filters: 'Clear Filters',
    apply_filters: 'Apply Filters',
    price_range: 'Price Range',
    brand: 'Brand',
    size: 'Size',
    color: 'Color',
    availability: 'Availability',
    off: 'off',
    noImage: 'No Image',
    adding: 'Adding...',
    addToCart: 'Add to Cart',

    // Product filters
    sort_by: 'Sort By',
    price_low_to_high: 'Price: Low to High',
    price_high_to_low: 'Price: High to Low',
    name_a_to_z: 'Name: A to Z',
    name_z_to_a: 'Name: Z to A',
    newest_first: 'Newest First',
    oldest_first: 'Oldest First',
    best_selling: 'Best Selling',
    customer_rating: 'Customer Rating',

    // Homepage components
    swipeForMore: 'Swipe for more',
    storeFeatures: 'Store Features',
    storeFeaturesDescription: 'Discover what makes our store special',

    // Additional homepage components
    errorLoadingComponents: 'Error loading components',
    pleaseRefreshPage: 'Please refresh the page',
    noContent: 'No Content Available',
    noContentDescription: 'This store hasn\'t been set up yet. Content will appear here once the store owner adds components.',
    storeOwner: 'Store Owner?',
    addComponentsInstructions: 'Add components to your homepage through the store management dashboard.',
    manageStore: 'Manage Store',
    customComponent: 'Custom Component',
    componentType: 'Component Type',

    // Wishlist
    are_you_sure_clear_wishlist: 'Are you sure you want to clear your wishlist?',
    wishlist_cleared: 'Wishlist cleared',
    login_to_view_wishlist: 'Please login to view your wishlist',
    wishlist_empty: 'Your wishlist is empty',
    start_adding_products: 'Start adding products you love to your wishlist',
    item: 'item',
    items: 'items',

    // Auth Modal
    pleaseLogin: 'Please Login',
    login_or_register: 'Login / Register',
    enter_verification_code: 'Enter Verification Code',
    complete_registration: 'Complete Registration',
    country: 'Country',
    phone_number: 'Phone Number',
    send_verification_code: 'Send Verification Code',
    sending: 'Sending...',
    verification_code_sent: 'We sent a verification code to',
    enter_code_label: 'Enter Verification Code',
    verify_code: 'Verify Code',
    verifying: 'Verifying...',
    change_number: 'Change Number',
    resend_code: 'Resend Code',
    complete_profile: 'Complete your profile to finish registration',
    email_address: 'Email Address',
    creating_account: 'Creating Account...',
    complete_registration_button: 'Complete Registration',
    please_enter_phone_number: 'Please enter a phone number',
    invalid_verification_code: 'Invalid verification code',
    verification_code_resent: 'Verification code resent',
    no_image_placeholder: 'No image available',

    // Pages
    pages: 'Pages',
    browse_all_pages: 'Browse all pages and content',
    no_pages_available: 'No pages available',
    check_back_later_for_new_pages: 'Check back later for new pages',

    // Reviews page
    error_loading_reviews: 'Error loading reviews',
    based_on_reviews: 'Based on {count} reviews',
    all_ratings: 'All Ratings',
    no_reviews_yet: 'No reviews yet',
    be_first_to_review: 'Be the first to review our products',
    browse_products: 'Browse Products',
    load_more_reviews: 'Load More Reviews',
    reviewed_product: 'Reviewed product',
    highest_rated: 'Highest Rated',
    lowest_rated: 'Lowest Rated',

    // Maintenance Mode
    maintenance_title: 'Maintenance Mode',
    maintenance_reason_title: 'Maintenance Reason',
    maintenance_estimated_time: 'Estimated Completion Time',
    maintenance_contact: 'If you need immediate assistance, please contact us:',
    maintenance_description: 'We are currently performing scheduled maintenance to improve your shopping experience. Please check back in a few moments.',
    maintenance_refresh: 'Check Again',

    // Checkout
    order_received: 'Order Received',
    thank_you_for_purchase: 'Thank you for your purchase',
    verifying_transaction: 'Verifying Transaction',
    processing_payment_result: 'Processing your payment result',
    confirm_payment_details: 'We\'re confirming your payment details. This will only take a moment.',
    invalid_checkout_link: 'Invalid Checkout Link',
    checkout_link_invalid_expired: 'This checkout link is invalid or has expired. Please try placing your order again.',
    back_to_cart: 'Back to Cart',
    back_to_store: 'Back to Store',
    payment_pending: 'Payment Pending',
    payment_still_processing: 'Your payment is still being processed. Please wait a moment or contact support if this persists.',
    transaction_id: 'Transaction ID',
    amount: 'Amount',
    status: 'Status',
    retry: 'Retry',
    need_help: 'Need help?',
    contact_support: 'Contact support',
    processing_request: 'Processing Request',
    please_wait_moment: 'Please wait a moment...',
    loading_checkout: 'Loading Checkout',
    please_wait: 'Please wait...',
    order_confirmed_processing: 'Your order has been confirmed and is being processed.',
    email_confirmation_shortly: 'You will receive an email confirmation shortly with your order details.',
    view_order_details: 'View Order Details',
    login_to_view_order: 'Login to View Order',
    payment_id: 'Payment ID',
    
    // Account page specific
    phone_number_cannot_be_changed: 'Phone number cannot be changed',
    update_profile: 'Update Profile',
    updating: 'Updating...',
    profile_updated_successfully: 'Profile updated successfully',
    error_updating_profile: 'Error updating profile',
    loading_account_information: 'Loading account information...',
    redirecting: 'Redirecting...',
    
    // Mobile menu
    more: 'More',
    less: 'Less',
    
    // Courses
    my_courses: 'My Courses',
    complete: 'Complete',
    active: 'Active',
    inactive: 'Inactive',
    continue_learning: 'Continue Learning',
    no_enrolled_courses: 'No Enrolled Courses',
    no_courses_description: 'You haven\'t enrolled in any courses yet',
    login_to_access_course: 'Please log in to access course content.',
    loading_course: 'Loading course...',
    course_not_found: 'Course Not Found',
    course_no_access: 'This course doesn\'t exist or you don\'t have access to it.',
    back_to_courses: 'Back to Courses',
    progress: 'Progress',
    modules: 'Modules',
    duration: 'Duration',
    level: 'Level',
    overall_progress: 'Overall Progress',
    active_enrollment: 'Active Enrollment',
    completed: 'Completed',
    enrolled: 'Enrolled',
    course_modules: 'Course Modules',
    min: 'min',
    module_content: 'Module Content',
    video_lesson: 'Video Lesson',
    watch_video_content: 'Watch the video content for this module',
    play_video: 'Play Video',
    resources: 'Resources',
    additional_materials: 'Additional materials and downloads',
    view_resources: 'View Resources',
    mark_as_complete: 'Mark as Complete',
    select_module: 'Select a Module',
    choose_module_content: 'Choose a module from the left to view its content',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    video: 'Video',
    text: 'Text',
    lesson_content: 'Lesson Content',
    no_content_available: 'No content available'
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    products: 'المنتجات',
    categories: 'الأقسام',
    about: 'حولنا',
    contact: 'اتصل بنا',
    cart: 'السلة',
    wishlist: 'المفضلة',
    account: 'الحساب',
    orders: 'الطلبات',
    courses: 'الدورات',
    subscriptions: 'الاشتراكات',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    menu: 'القائمة',
    search: 'البحث',
    navigation: 'التنقل',
    tools: 'الأدوات',
    theme: 'المظهر',
    view: 'عرض',

    // Common actions
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    submit: 'إرسال',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    back: 'العودة',
    next: 'التالي',
    previous: 'السابق',
    close: 'إغلاق',
    view_all: 'عرض الكل',
    read_more: 'اقرأ المزيد',
    show_more: 'عرض المزيد',
    show_less: 'عرض أقل',

    // E-commerce specific
    add_to_cart: 'أضف للسلة',
    add_to_wishlist: 'أضف للمفضلة',
    remove_from_wishlist: 'إزالة من المفضلة',
    buy_now: 'اشتري الآن',
    quick_purchase: 'شراء سريع',
    price: 'السعر',
    quantity: 'الكمية',
    total: 'الإجمالي',
    subtotal: 'المجموع الفرعي',
    shipping: 'الشحن',
    tax: 'الضريبة',
    discount: 'الخصم',
    coupon: 'كوبون',
    apply_coupon: 'تطبيق الكوبون',
    remove_coupon: 'إزالة الكوبون',
    checkout: 'الدفع',
    continue_shopping: 'متابعة التسوق',
    empty_cart: 'سلة التسوق فارغة',
    empty_wishlist: 'قائمة المفضلة فارغة',
    in_stock: 'متوفر',
    out_of_stock: 'غير متوفر',
    free_shipping: 'شحن مجاني',
    featured: 'مميز',
    sale: 'تخفيض',
    new: 'جديد',
    bestseller: 'الأكثر مبيعاً',

    // Product page
    product_details: 'تفاصيل المنتج',
    specifications: 'المواصفات',
    reviews: 'التقييمات',
    related_products: 'منتجات ذات صلة',
    product_images: 'صور المنتج',
    select_variant: 'اختر النوع',
    variants: 'الأنواع',
    description: 'الوصف',
    short_description: 'وصف مختصر',
    rating: 'التقييم',
    write_review: 'اكتب تقييم',
    no_reviews: 'لا توجد تقييمات بعد',
    share: 'مشاركة',

    // Cart page
    shopping_cart: 'سلة التسوق',
    update_cart: 'تحديث السلة',
    remove_item: 'إزالة العنصر',
    cart_summary: 'ملخص السلة',
    order_summary: 'ملخص الطلب',
    proceed_to_checkout: 'متابعة للدفع',
    clear_cart: 'إفراغ السلة',
    clear_all: 'مسح الجميع',
    cart_total: 'إجمالي السلة',

    // Account page
    my_account: 'حسابي',
    profile: 'الملف الشخصي',
    personal_info: 'المعلومات الشخصية',
    change_password: 'تغيير كلمة المرور',
    address_book: 'دفتر العناوين',
    order_history: 'تاريخ الطلبات',
    download_history: 'تاريخ التحميل',
    reward_points: 'نقاط المكافآت',
    affiliate: 'التسويق بالعمولة',
    newsletter: 'النشرة الإخبارية',
    wishlist_items: 'عناصر المفضلة',

    // Orders page
    order_id: 'رقم الطلب',
    order_date: 'تاريخ الطلب',
    order_status: 'حالة الطلب',
    order_total: 'إجمالي الطلب',
    view_order: 'عرض الطلب',
    track_order: 'تتبع الطلب',
    reorder: 'إعادة الطلب',
    order_details: 'تفاصيل الطلب',
    billing_address: 'عنوان الفاتورة',
    shipping_address: 'عنوان الشحن',
    payment_method: 'طريقة الدفع',
    shipping_method: 'طريقة الشحن',
    no_orders: 'لا توجد طلبات',

    // Auth
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirm_password: 'تأكيد كلمة المرور',
    first_name: 'الاسم الأول',
    last_name: 'اسم العائلة',
    phone: 'الهاتف',
    forgot_password: 'نسيت كلمة المرور؟',
    remember_me: 'تذكرني',
    create_account: 'إنشاء حساب',
    already_have_account: 'هل لديك حساب بالفعل؟',
    dont_have_account: 'ليس لديك حساب؟',
    login_required: 'تسجيل الدخول مطلوب',
    registration_successful: 'التسجيل ناجح',
    login_successful: 'تم تسجيل الدخول بنجاح',
    logout_successful: 'تسجيل الخروج ناجح',

    // Notifications
    item_added_to_cart: 'تم إضافة العنصر للسلة',
    item_removed_from_cart: 'تم إزالة العنصر من السلة',
    item_added_to_wishlist: 'تم إضافة العنصر للمفضلة',
    item_removed_from_wishlist: 'تم إزالة العنصر من المفضلة',
    order_placed_successfully: 'تم تقديم الطلب بنجاح',
    profile_updated: 'تم تحديث الملف الشخصي بنجاح',
    password_changed: 'تم تغيير كلمة المرور بنجاح',
    coupon_applied: 'تم تطبيق الكوبون بنجاح',
    coupon_removed: 'تم إزالة الكوبون',
    invalid_coupon: 'رمز الكوبون غير صحيح',

    // Reviews
    customer_reviews: 'تقييمات العملاء',
    write_a_review: 'اكتب تقييم',
    review_title: 'عنوان التقييم',
    your_review: 'تقييمك',
    submit_review: 'إرسال التقييم',
    submitReview: 'إرسال التقييم',
    helpful: 'مفيد',
    not_helpful: 'غير مفيد',
    verified_purchase: 'شراء موثق',
    stars: 'نجوم',
    selectRating: 'اختر تقييماً',
    pleaseSelectRating: 'يرجى اختيار تقييم',
    pleaseWriteComment: 'يرجى كتابة تعليق',
    reviewSubmitted: 'تم إرسال التقييم بنجاح',
    poor: 'سيء',
    fair: 'مقبول',
    good: 'جيد',
    veryGood: 'جيد جداً',
    excellent: 'ممتاز',
    writeReview: 'كتابة تقييم',

    // Language switcher
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',

    // Theme switcher
    toggleTheme: 'تبديل المظهر',
    lightTheme: 'فاتح',
    darkTheme: 'داكن',
    systemTheme: 'النظام',

    // Footer
    footer_about: 'عنا',
    footer_contact: 'اتصل بنا',
    footer_privacy: 'سياسة الخصوصية',
    footer_terms: 'شروط الخدمة',
    footer_help: 'مركز المساعدة',
    footer_shipping: 'معلومات الشحن',
    footer_returns: 'المرتجعات',
    footer_newsletter: 'النشرة الإخبارية',
    footer_social: 'تابعنا',

    // Categories and featured products
    shop_by_category: 'تسوق حسب الفئة',
    featured_products: 'المنتجات المميزة',
    latest_products: 'أحدث المنتجات',
    popular_products: 'المنتجات الشائعة',
    recommended_products: 'المنتجات الموصى بها',
    view_all_categories: 'عرض جميع الفئات',
    view_all_products: 'عرض جميع المنتجات',
    category_products: 'منتجات الفئة',
    no_products_found: 'لم يتم العثور على منتجات',
    products_found: 'منتجات موجودة',

    // Quick purchase and enhanced features
    quick_view: 'عرض سريع',
    compare: 'مقارنة',
    compare_products: 'مقارنة المنتجات',
    size_guide: 'دليل المقاسات',
    ask_question: 'اسأل سؤال',
    notify_when_available: 'أشعرني عند التوفر',
    bulk_order: 'طلب بالجملة',
    wholesale: 'جملة',

    // Review functionality
    review_helpful_question: 'هل كان هذا التقييم مفيداً؟',
    yes: 'نعم',
    no: 'لا',
    report_review: 'الإبلاغ عن التقييم',
    sort_reviews: 'ترتيب التقييمات',
    most_recent: 'الأحدث',
    most_helpful: 'الأكثر إفادة',
    highest_rating: 'أعلى تقييم',
    lowest_rating: 'أقل تقييم',

    // Additional order detail translations
    order_information: 'معلومات الطلب',
    customer_information: 'معلومات العميل',
    payment_information: 'معلومات الدفع',
    order_comment: 'تعليق الطلب',

    // Additional missing keys
    filter: 'تصفية',
    sort: 'ترتيب',
    clear_filters: 'مسح التصفية',
    apply_filters: 'تطبيق التصفية',
    price_range: 'نطاق السعر',
    brand: 'العلامة التجارية',
    size: 'المقاس',
    color: 'اللون',
    availability: 'التوفر',
    off: 'خصم',
    noImage: 'لا توجد صورة',
    adding: 'جاري الإضافة...',
    addToCart: 'أضف للسلة',

    // Product filters
    sort_by: 'ترتيب حسب',
    price_low_to_high: 'السعر: من الأقل للأعلى',
    price_high_to_low: 'السعر: من الأعلى للأقل',
    name_a_to_z: 'الاسم: أ إلى ي',
    name_z_to_a: 'الاسم: ي إلى أ',
    newest_first: 'الأحدث أولاً',
    oldest_first: 'الأقدم أولاً',
    best_selling: 'الأكثر مبيعاً',
    customer_rating: 'تقييم العملاء',

    // Homepage components
    swipeForMore: 'اسحب للمزيد',
    storeFeatures: 'مميزات المتجر',
    storeFeaturesDescription: 'اكتشف ما يجعل متجرنا مميزاً',

    // Additional homepage components
    errorLoadingComponents: 'خطأ في تحميل المكونات',
    pleaseRefreshPage: 'يرجى تحديث الصفحة',
    noContent: 'لا يوجد محتوى متاح',
    noContentDescription: 'لم يتم إعداد هذا المتجر بعد. سيظهر المحتوى هنا بمجرد إضافة صاحب المتجر للمكونات.',
    storeOwner: 'صاحب المتجر؟',
    addComponentsInstructions: 'أضف مكونات إلى صفحتك الرئيسية من خلال لوحة إدارة المتجر.',
    manageStore: 'إدارة المتجر',
    customComponent: 'مكون مخصص',
    componentType: 'نوع المكون',

    // Wishlist
    are_you_sure_clear_wishlist: 'هل أنت متأكد من أنك تريد مسح قائمة المفضلة؟',
    wishlist_cleared: 'تم مسح قائمة المفضلة',
    login_to_view_wishlist: 'يرجى تسجيل الدخول لعرض قائمة المفضلة',
    wishlist_empty: 'قائمة المفضلة فارغة',
    start_adding_products: 'ابدأ بإضافة المنتجات التي تحبها إلى قائمة المفضلة',
    item: 'عنصر',
    items: 'عناصر',

    // Auth Modal
    pleaseLogin: 'يرجى تسجيل الدخول',
    login_or_register: 'تسجيل الدخول / التسجيل',
    enter_verification_code: 'أدخل رمز التحقق',
    complete_registration: 'إكمال التسجيل',
    country: 'الدولة',
    phone_number: 'رقم الهاتف',
    send_verification_code: 'إرسال رمز التحقق',
    sending: 'جاري الإرسال...',
    verification_code_sent: 'تم إرسال رمز التحقق إلى',
    enter_code_label: 'أدخل رمز التحقق',
    verify_code: 'تحقق من الرمز',
    verifying: 'جاري التحقق...',
    change_number: 'تغيير الرقم',
    resend_code: 'إعادة إرسال الرمز',
    complete_profile: 'أكمل ملفك الشخصي لإنهاء التسجيل',
    email_address: 'عنوان البريد الإلكتروني',
    creating_account: 'جاري إنشاء الحساب...',
    complete_registration_button: 'إكمال التسجيل',
    please_enter_phone_number: 'يرجى إدخال رقم الهاتف',
    invalid_verification_code: 'رمز التحقق غير صحيح',
    verification_code_resent: 'تم إعادة إرسال رمز التحقق',
    no_image_placeholder: 'لا توجد صورة متاحة',

    // Pages
    pages: 'الصفحات',
    browse_all_pages: 'تصفح جميع الصفحات والمحتوى',
    no_pages_available: 'لا توجد صفحات متاحة',
    check_back_later_for_new_pages: 'تحقق مرة أخرى لاحقاً للصفحات الجديدة',

    // Reviews page
    error_loading_reviews: 'خطأ في تحميل التقييمات',
    based_on_reviews: 'بناءً على {count} تقييم',
    all_ratings: 'جميع التقييمات',
    no_reviews_yet: 'لا توجد تقييمات بعد',
    be_first_to_review: 'كن أول من يقيم منتجاتنا',
    browse_products: 'تصفح المنتجات',
    load_more_reviews: 'تحميل المزيد من التقييمات',
    reviewed_product: 'المنتج المقيم',
    highest_rated: 'أعلى تقييم',
    lowest_rated: 'أقل تقييم',

    // Maintenance Mode
    maintenance_title: 'وضع الصيانة',
    maintenance_reason_title: 'سبب الصيانة',
    maintenance_estimated_time: 'الوقت المقدر للانتهاء',
    maintenance_contact: 'إذا كنت بحاجة إلى مساعدة فورية، يرجى الاتصال بنا:',
    maintenance_description: 'نحن نقوم حالياً بصيانة مجدولة لتحسين تجربة التسوق الخاصة بك. يرجى العودة خلال لحظات.',
    maintenance_refresh: 'تحقق مرة أخرى',

    // Checkout
    order_received: 'تم استلام الطلب',
    thank_you_for_purchase: 'شكراً لك على شرائك',
    verifying_transaction: 'جاري التحقق من المعاملة',
    processing_payment_result: 'جاري معالجة نتيجة الدفع',
    confirm_payment_details: 'نحن نؤكد تفاصيل الدفع الخاصة بك. سيستغرق هذا لحظة واحدة فقط.',
    invalid_checkout_link: 'رابط الدفع غير صالح',
    checkout_link_invalid_expired: 'رابط الدفع هذا غير صالح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.',
    back_to_cart: 'العودة للسلة',
    back_to_store: 'العودة للمتجر',
    payment_pending: 'الدفع معلق',
    payment_still_processing: 'لا يزال دفعك قيد المعالجة. يرجى الانتظار لحظة أو الاتصال بالدعم إذا استمر هذا.',
    transaction_id: 'رقم المعاملة',
    amount: 'المبلغ',
    status: 'الحالة',
    retry: 'إعادة المحاولة',
    need_help: 'تحتاج مساعدة؟',
    contact_support: 'اتصل بالدعم',
    processing_request: 'جاري معالجة الطلب',
    please_wait_moment: 'يرجى الانتظار لحظة...',
    loading_checkout: 'جاري تحميل الدفع',
    please_wait: 'يرجى الانتظار...',
    order_confirmed_processing: 'تم تأكيد طلبك وهو قيد المعالجة.',
    email_confirmation_shortly: 'ستتلقى رسالة تأكيد بالبريد الإلكتروني قريباً مع تفاصيل طلبك.',
    view_order_details: 'عرض تفاصيل الطلب',
    login_to_view_order: 'سجل الدخول لعرض الطلب',
    payment_id: 'رقم الدفع',
    
    // Account page specific
    phone_number_cannot_be_changed: 'لا يمكن تغيير رقم الهاتف',
    update_profile: 'تحديث الملف الشخصي',
    updating: 'جاري التحديث...',
    profile_updated_successfully: 'تم تحديث الملف الشخصي بنجاح',
    error_updating_profile: 'خطأ في تحديث الملف الشخصي',
    loading_account_information: 'جاري تحميل معلومات الحساب...',
    redirecting: 'جاري إعادة التوجيه...',
    
    // Mobile menu
    more: 'المزيد',
    less: 'أقل',
    
    // Courses
    my_courses: 'دوراتي',
    complete: 'مكتمل',
    active: 'نشط',
    inactive: 'غير نشط',
    continue_learning: 'متابعة التعلم',
    no_enrolled_courses: 'لا توجد دورات مسجلة',
    no_courses_description: 'لم تسجل في أي دورات بعد',
    login_to_access_course: 'يرجى تسجيل الدخول للوصول إلى محتوى الدورة.',
    loading_course: 'جاري تحميل الدورة...',
    course_not_found: 'الدورة غير موجودة',
    course_no_access: 'هذه الدورة غير موجودة أو ليس لديك صلاحية للوصول إليها.',
    back_to_courses: 'العودة للدورات',
    progress: 'التقدم',
    modules: 'الوحدات',
    duration: 'المدة',
    level: 'المستوى',
    overall_progress: 'التقدم الإجمالي',
    active_enrollment: 'التسجيل النشط',
    completed: 'مكتمل',
    enrolled: 'مسجل',
    course_modules: 'وحدات الدورة',
    min: 'دقيقة',
    module_content: 'محتوى الوحدة',
    video_lesson: 'درس فيديو',
    watch_video_content: 'شاهد محتوى الفيديو لهذه الوحدة',
    play_video: 'تشغيل الفيديو',
    resources: 'الموارد',
    additional_materials: 'مواد إضافية وتحميلات',
    view_resources: 'عرض الموارد',
    mark_as_complete: 'وضع علامة مكتمل',
    select_module: 'اختر وحدة',
    choose_module_content: 'اختر وحدة من اليسار لعرض محتواها',
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
    video: 'فيديو',
    text: 'نص',
    lesson_content: 'محتوى الدرس',
    no_content_available: 'لا يوجد محتوى متاح'
  }
};

export type TranslationKey = keyof typeof translations.en;

export function useTranslation() {
  const { locale } = useLanguage();

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const translation = translations[locale as keyof typeof translations]?.[key] || translations.en[key] || key;

    if (!params) return translation;

    // Simple parameter replacement
    return Object.entries(params).reduce((text, [param, value]) => {
      return text.replace(new RegExp(`{${param}}`, 'g'), String(value));
    }, translation);
  };

  return { t, locale };
}
