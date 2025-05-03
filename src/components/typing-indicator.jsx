export function TypingIndicator() {
  return (
    <div className="flex gap-2 items-center justify-center py-4 px-4 rounded-lg bg-muted text-muted-foreground max-w-fit">
      <span className="sr-only">Bot is typing</span>
      <span className="w-2 h-2 rounded-full bg-current animate-[bounce_1.4s_ease-in-out_0s_infinite]" />
      <span className="w-2 h-2 rounded-full bg-current animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
      <span className="w-2 h-2 rounded-full bg-current animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
    </div>
  );
}
