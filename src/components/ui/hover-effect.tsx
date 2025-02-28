'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Define the interface for the item structure
interface Item {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const HoverEffect = ({ items }: { items: Item[] }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          className="relative overflow-hidden rounded-lg border bg-background p-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <div className="flex h-[180px] flex-col justify-between items-center rounded-md p-6">
            <motion.div
              className="flex justify-center items-center h-12 w-12"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {item.icon}
            </motion.div>
            <div className="space-y-2 text-center">
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
