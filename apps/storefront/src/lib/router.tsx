import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { StorefrontLayout } from '@/components/templates/storefront-layout';
import { listProducts } from './api';

const CatalogPage = lazy(() =>
  import('@/pages/catalog').then((module) => ({ default: module.CatalogPage })),
);

const ProductPage = lazy(() =>
  import('@/pages/product').then((module) => ({ default: module.ProductPage })),
);

const CartPage = lazy(() =>
  import('@/pages/cart').then((module) => ({ default: module.CartPage })),
);

const CheckoutPage = lazy(() =>
  import('@/pages/checkout').then((module) => ({ default: module.CheckoutPage })),
);

const OrderStatusPage = lazy(() =>
  import('@/pages/order-status').then((module) => ({ default: module.OrderStatusPage })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StorefrontLayout />,
    loader: async () => {
      const products = await listProducts();
      return { products };
    },
    children: [
      {
        index: true,
        element: <CatalogPage />,
      },
      {
        path: 'p/:productId',
        element: <ProductPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'order/:orderId',
        element: <OrderStatusPage />,
      },
    ],
  },
]);
