import { appConfig } from '@/configs/app.config';
import { Brand } from './Brand';

export function Footer() {
    return (
        <footer className='border-border border-t bg-card'>
            <div className='container mx-auto px-4 py-12'>
                <div className='grid gap-8 md:grid-cols-4'>
                    <div className='md:col-span-2'>
                        <Brand />
                        <p className='mb-4 max-w-md text-muted-foreground'>
                            Making cooking and household management easy and
                            fun. Transform your kitchen experience with
                            organized ingredients, delicious recipes, and
                            seamless meal planning.
                        </p>
                    </div>

                    <div>
                        <h3 className='mb-4 font-semibold'>Support</h3>
                        <div className='space-y-2'>
                            {/* <Link
                                href='/contact'
                                className='block text-muted-foreground transition-colors hover:text-foreground'
                            >
                                Contact Us
                            </Link>
                            <Link
                                href='/help'
                                className='block text-muted-foreground transition-colors hover:text-foreground'
                            >
                                Help Center
                            </Link>
                            <Link
                                href='/faq'
                                className='block text-muted-foreground transition-colors hover:text-foreground'
                            >
                                FAQ
                            </Link> */}
                        </div>
                    </div>

                    <div>
                        <h3 className='mb-4 font-semibold'>Legal</h3>
                        <div className='space-y-2'>
                            {/* <Link
                                href='/privacy'
                                className='block text-muted-foreground transition-colors hover:text-foreground'
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href='/terms'
                                className='block text-muted-foreground transition-colors hover:text-foreground'
                            >
                                Terms & Conditions
                            </Link>
                            <Link
                                href='/cookies'
                                className='block text-muted-foreground transition-colors hover:text-foreground'
                            >
                                Cookie Policy
                            </Link> */}
                        </div>
                    </div>
                </div>

                <div className='mt-8 border-border border-t pt-8 text-center text-muted-foreground'>
                    <p>
                        &copy; 2025 {appConfig.appName}. All rights reserved.
                        Made with ❤️ for home cooks everywhere.
                    </p>
                </div>
            </div>
        </footer>
    );
}
