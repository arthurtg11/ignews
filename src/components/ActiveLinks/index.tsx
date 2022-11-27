import { ReactElement, cloneElement } from "react"
import Link, { LinkProps } from "next/link"
import { useRouter } from "next/dist/client/router";

// Todas as propriedadas que o link ja recebe mais, o Children e o active.
interface ActiveLinkProps extends LinkProps {
    children: ReactElement;
    activeClassName: string;
}
//Todo o resto das propriedades estão nesse objeto rest
export function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps) {

    const { asPath } = useRouter();

    const className = asPath == rest.href
    ? activeClassName
    : ''

    return (
        <Link {...rest}>
            {cloneElement(children, {
                className,
            })}
        </Link>
    );
}