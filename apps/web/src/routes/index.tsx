import { SignInButton } from "@clerk/clerk-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Footer } from "@/components/layouts/Footer";
import { Header } from "@/components/layouts/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { features, SectionHash, stages } from "@/pages/landing-page";
import "../App.css";

export const Route = createFileRoute("/")({
	component: LandingPage,
	staticData: {
		links: [
			{
				label: "Features",
				to: ".",
				hash: SectionHash.Features,
			},
			{
				label: "How It Works",
				to: ".",
				hash: SectionHash.HowItWorks,
			},
			{
				label: "A",
				to: "/a",
			},
		],
	},
});

const StartNowBtn = () => (
	<>
		Start Cooking Today <ArrowRight className="ml-2 h-5 w-5" />
	</>
);

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-background">
			<Header />

			<section className="px-4 py-20">
				<div className="container mx-auto max-w-4xl text-center">
					<Badge variant="secondary" className="mb-6">
						🍳 Making Cooking Fun & Easy
					</Badge>
					<h1 className="mb-6 text-balance font-bold text-4xl md:text-6xl">
						Your Complete
						<span className="text-primary"> Kitchen Companion</span>
					</h1>
					<p className="mx-auto mb-8 max-w-2xl text-balance text-muted-foreground text-xl">
						Transform your cooking experience with smart ingredient management,
						personalized recipes, and seamless meal planning for your entire
						household.
					</p>
					<div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
						<Button size="lg" className="px-8 text-lg" asChild>
							<div>
								<Unauthenticated>
									<SignInButton>
										<StartNowBtn />
									</SignInButton>
								</Unauthenticated>
								<Authenticated>
									<Link to="/">
										<StartNowBtn />
									</Link>
								</Authenticated>
							</div>
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="bg-transparent px-8 text-lg"
						>
							Watch Demo
						</Button>
					</div>

					{/* <div className='relative'>
                        <Card className='overflow-hidden border-2 border-primary/20 shadow-2xl'>
                            <CardContent className='p-0'>
                                <img
                                    src='/modern-kitchen-dashboard-interface-with-ingredient.jpg'
                                    alt='App Dashboard Preview'
                                    className='h-auto w-full'
                                />
                            </CardContent>
                        </Card>
                    </div> */}
				</div>
			</section>

			<section id={SectionHash.Features} className="bg-muted/30 px-4 py-20">
				<div className="container mx-auto">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							Everything You Need to Cook with Confidence
						</h2>
						<p className="mx-auto max-w-2xl text-muted-foreground text-xl">
							From ingredient tracking to meal planning, we've got your kitchen
							covered.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{features.map((feat) => (
							<Card
								key={feat.title}
								className="border-2 transition-colors hover:border-primary/50"
							>
								<CardContent className="p-6">
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
										<feat.Icon className="h-6 w-6 text-primary" />
									</div>
									<h3 className="mb-3 font-semibold text-xl">{feat.title}</h3>
									<p className="mb-4 text-muted-foreground">
										{feat.description}
									</p>
									<ul className="space-y-2 text-sm">
										{feat.info.map((info) => (
											<li key={info} className="flex items-center gap-2">
												<CheckCircle className="h-4 w-4 text-primary" />
												{info}
											</li>
										))}
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-primary" />
											Visual ingredient library
										</li>
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-primary" />
											Expiry date alerts
										</li>
										<li className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-primary" />
											Quantity management
										</li>
									</ul>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			<section id={SectionHash.HowItWorks} className="px-4 py-20">
				<div className="container mx-auto">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							How CookEase Works
						</h2>
						<p className="mx-auto max-w-2xl text-muted-foreground text-xl">
							Get started in minutes and transform your cooking experience.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-3">
						{stages.map((stage, idx) => (
							<div key={stage.title} className="text-center">
								<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
									<span className="font-bold text-2xl text-primary-foreground">
										{idx + 1}
									</span>
								</div>
								<h3 className="mb-4 font-semibold text-xl">{stage.title}</h3>
								<p className="text-muted-foreground">{stage.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="bg-primary px-4 py-20 text-primary-foreground">
				<div className="container mx-auto text-center">
					<h2 className="mb-4 font-bold text-3xl md:text-4xl">
						Ready to Transform Your Kitchen?
					</h2>
					<p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
						Join thousands of home cooks who've made cooking easier, more
						organized, and more enjoyable.
					</p>
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button
							size="lg"
							variant="secondary"
							className="px-8 text-lg"
							asChild
						>
							{/* <Link href='/auth/signup'>
                                Start Your Free Trial
                                <ArrowRight className='ml-2 h-5 w-5' />
                            </Link> */}
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="border-primary-foreground bg-transparent px-8 text-lg text-primary-foreground hover:bg-primary-foreground hover:text-primary"
						>
							Schedule a Demo
						</Button>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	);
}
