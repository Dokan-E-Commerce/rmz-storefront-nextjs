#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need specific manual fixes
const specificFixes = [
  {
    file: 'src/app/products/[slug]/ClientProductPage.tsx',
    fixes: [
      {
        search: 'const [customFields, setCustomFields] = useState<{ [key: string]: string }>({};',
        replace: 'const [customFields, setCustomFields] = useState<{ [key: string]: string }>({});'
      },
      {
        search: 'const { data: product, isLoading: productLoading, error } = useQuery({};',
        replace: `const { data: product, isLoading: productLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProduct(slug),
    enabled: !!slug && !initialProduct,
    initialData: initialProduct,
  });`
      },
      {
        search: 'const { ref: loadMoreRef, inView } = useInView({};',
        replace: `const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });`
      }
    ]
  },
  {
    file: 'src/lib/cart.ts',
    fixes: [
      {
        search: 'addItem: (\n    fields?: { [key: string]: string },\n    subscriptionPlan?: any,\n    notice?: string\n  ) => Promise<void>;',
        replace: 'addItem: (\n    product: Product,\n    quantity: number,\n    fields?: { [key: string]: string },\n    subscriptionPlan?: any,\n    notice?: string\n  ) => Promise<void>;'
      }
    ]
  }
];

// Apply specific fixes
specificFixes.forEach(({ file, fixes }) => {
  const filePath = path.join('/Users/ahmed/Desktop/rmz-app/storefront-example', file);
  
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  fixes.forEach(({ search, replace }) => {
    if (content.includes(search)) {
      content = content.replace(search, replace);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed:', file);
  }
});

console.log('Specific syntax fixes completed!');