#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Comprehensive syntax fixes
const fixes = [
  // Cart.ts fixes
  {
    file: 'src/lib/cart.ts',
    search: '          };',
    replace: '          });'
  },
  
  // Account courses page
  {
    file: 'src/app/account/courses/page.tsx',
    search: 'const { data: courses, isLoading } = useQuery({};',
    replace: `const { data: courses, isLoading } = useQuery({
    queryKey: ['user-courses'],
    queryFn: async () => {
      // Placeholder until courses API is implemented
      return [];
    },
  });`
  },
  
  // Account page profile schema
  {
    file: 'src/app/account/page.tsx',
    search: 'const profileSchema = z.object({};',
    replace: `const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
});`
  },
  
  // Account subscriptions page
  {
    file: 'src/app/account/subscriptions/page.tsx',
    search: 'const { data: subscriptions, isLoading } = useQuery({};',
    replace: `const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      // Placeholder until subscriptions API is implemented
      return [];
    },
  });`
  },
  
  // Cart page error logging
  {
    file: 'src/app/cart/page.tsx',
    search: '        message: error.message\n      });',
    replace: ''
  }
];

// Apply all fixes
fixes.forEach(({ file, search, replace }) => {
  const filePath = path.join('/Users/ahmed/Desktop/rmz-app/storefront-example', file);
  
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
    console.log('Fixed:', file);
  } else {
    console.log('Pattern not found in:', file);
  }
});

console.log('All syntax fixes completed!');