import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background py-16 sm:py-24 lg:py-32 flex items-center justify-center container-padding">
      <div className="w-full max-w-md">
        <Card className="glass-strong border-destructive/20 border shadow-2xl">
          <CardHeader className="text-center pt-10">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Access <span className="text-destructive">Restricted</span></CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-8 px-8 pb-10">
            <p className="text-lg text-muted-foreground leading-relaxed">
              This gallery's private archives require higher tier credentials. Please contact an administrator or sign in with an authorized account.
            </p>
            <div className="space-y-4">
              <Button asChild className="btn-primary w-full h-12 glow-primary">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Gallery
                </Link>
              </Button>
              <Button variant="outline" asChild className="glass-strong border-border/50 w-full h-12 hover:bg-muted font-bold">
                <Link href="/login">Sign In as Admin</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
