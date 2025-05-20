import dynamic from 'next/dynamic'
 
const DynamicComponentWithNoSSR = dynamic(
  () => import('@/components/ui/pomodoroTimer'),
  { ssr: false }
)


export default function Home() {
  return (
 <main>
  <DynamicComponentWithNoSSR />
 </main>
  );
}
