import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/95 hover:shadow-primary/30 hover:-translate-y-0.5",
				destructive:
					"bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/90 hover:shadow-destructive/30 hover:-translate-y-0.5",
				outline:
					"border border-border/60 bg-background/50 backdrop-blur-sm shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent hover:-translate-y-0.5",
				secondary:
					"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:-translate-y-0.5",
				ghost: "hover:bg-accent/50 hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
				glass:
					"bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 backdrop-blur-md text-foreground hover:bg-white/20 dark:hover:bg-black/30 hover:-translate-y-0.5 font-medium",
			},
			size: {
				default: "h-10 px-5 py-2",
				sm: "h-9 px-4 rounded-md text-xs",
				lg: "h-12 px-8 rounded-xl text-base",
				icon: "size-10 rounded-lg",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
