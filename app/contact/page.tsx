"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react"
import { SITE, whatsappLink } from "@/lib/auth-client"
import { toast } from "sonner"

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: "", phone: "", message: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // The site has no email backend yet, so we open a pre-filled WhatsApp chat
    // with the message — the fastest honest way for a buyer to reach the gallery.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const text = [
            `Hello ${SITE.name}!`,
            ``,
            `My name is ${formData.name}.`,
            formData.message,
            ``,
            `(You can reach me on ${formData.phone})`,
        ].join("\n")

        try {
            window.open(whatsappLink(SITE.phones[0], text), "_blank", "noopener,noreferrer")
            toast.success("Opening WhatsApp with your message — just press send!")
            setFormData({ name: "", phone: "", message: "" })
        } catch {
            toast.error("Could not open WhatsApp. Call us instead: " + SITE.phones[0])
        } finally {
            setIsSubmitting(false)
        }
    }

    const contactInfo = [
        {
            icon: Phone,
            title: "Call us",
            lines: SITE.phones,
            description: SITE.hours,
            hrefPrefix: "tel:",
        },
        {
            icon: MapPin,
            title: "Where we are",
            lines: [SITE.location],
            description: "Visits by appointment only",
        },
        {
            icon: Clock,
            title: "Response time",
            lines: ["Within 24 hours"],
            description: "We reply to every message personally",
        },
    ]

    return (
        <div className="bg-background py-14 sm:py-20">
            <div className="container mx-auto px-6 max-w-5xl space-y-12">
                {/* Header */}
                <header className="text-center space-y-4">
                    <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-tight heading-flourish inline-block">
                        Contact Us
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Questions about a piece, an order, or joining as an artist?
                        Message us on WhatsApp or just call.
                    </p>
                </header>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Form */}
                    <Card>
                        <CardContent className="p-6 md:p-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="font-display text-2xl font-semibold text-foreground">Send a message</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Fill this in and we&apos;ll open WhatsApp with your message ready to send.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone number *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                            placeholder="+250 7..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message *</Label>
                                        <Textarea
                                            id="message"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            rows={5}
                                            className="resize-none"
                                            placeholder="Hi! I'd like to ask about..."
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="btn-primary w-full h-11"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            "Opening WhatsApp..."
                                        ) : (
                                            <>
                                                <MessageCircle className="mr-2 w-4 h-4" />
                                                Send via WhatsApp
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-[11px] text-muted-foreground text-center">
                                        Prefer talking? Call us directly at {SITE.phones[0]}.
                                    </p>
                                </form>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact info */}
                    <div className="space-y-4">
                        <h2 className="font-display text-2xl font-semibold text-foreground">Reach out directly</h2>
                        {contactInfo.map((info) => (
                            <Card key={info.title}>
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 text-secondary">
                                            <info.icon className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <h3 className="font-semibold text-foreground">{info.title}</h3>
                                            {info.lines.map((line) =>
                                                info.hrefPrefix ? (
                                                    <a
                                                        key={line}
                                                        href={`${info.hrefPrefix}${line.replace(/\s/g, "")}`}
                                                        className="block text-foreground font-medium hover:text-secondary transition-colors"
                                                    >
                                                        {line}
                                                    </a>
                                                ) : (
                                                    <p key={line} className="text-foreground font-medium">{line}</p>
                                                )
                                            )}
                                            <p className="text-xs text-muted-foreground">{info.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* WhatsApp shortcut */}
                        <Card className="border-secondary/30">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-600">
                                        <Send className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Fastest reply</h3>
                                        <a
                                            href={whatsappLink(SITE.phones[0], `Hello ${SITE.name}! I have a question.`)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-secondary font-medium hover:underline"
                                        >
                                            Chat with us on WhatsApp →
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
