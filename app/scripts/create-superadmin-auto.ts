
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'superadmin@citaplanner.com'
    const password = 'superadmin123'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Need a tenant first. Seed should have created one.
    const tenantCount = await prisma.tenant.count()

    if (tenantCount === 0) {
        console.log('No tenant found. Creating default tenant...')
        const newTenant = await prisma.tenant.create({
            data: {
                name: 'Bella Vita Spa & Wellness',
                email: 'contacto@bellavita.com',
                phone: '+52 55 1234 5678',
                address: 'Avenida Reforma 123, Col. Centro',
                city: 'Ciudad de México',
                country: 'México'
            }
        })

        await prisma.branch.create({
            data: {
                name: 'Sucursal Centro',
                address: 'Avenida Reforma 123',
                phone: '+52 55 1234 5678',
                email: 'centro@bellavita.com',
                tenantId: newTenant.id
            }
        })
        console.log('Default tenant and branch created.')
    }

    const existingTenant = await prisma.tenant.findFirst()

    if (!existingTenant) throw new Error("Failed to retrieve tenant even after creation attempt.")

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'SUPERADMIN',
            password: hashedPassword
        },
        create: {
            email,
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            phone: '+52 55 9999 9999',
            role: 'SUPERADMIN',
            tenantId: existingTenant.id
        }
    })
    console.log(`SUPERADMIN CREATED: ${email} / ${password}`)
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
