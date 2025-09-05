import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation"; 

const NewInterviewPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in'); 
  }

  return (
    <Agent
      userName={user?.name!}
      userId={user?.id}
      type="generate"
    />
  );
};

export default NewInterviewPage;