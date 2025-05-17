import { Outlet, useParams } from "react-router-dom";
// import SidebarCurso from "../../components/SidebarCurso";

export function CursoLayout() {
  const { cursoId } = useParams();
  console.log(cursoId);

  return (
    <div className="flex h-screen">
      {/* <SidebarCurso cursoId={cursoId!} /> */}
      <main className="flex-1 bg-gray-100 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}